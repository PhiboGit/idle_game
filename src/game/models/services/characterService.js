const { default: mongoose } = require('mongoose')

const Character = require('../character')
const Item = require('../item')
const GatheringExpTable = require('../../data/gatheringExpTable')

const {senderMediator} = require('../../../routes/websocket/mediator')


/**
 * Increments the characters values and updates the database.
 * It also updates the level when exp was incremented.
 * 
 * @param {String} character 
 * @param {Object} form 
 */
async function increment(character, incrementForm = {}, setForm= {}, pushForm={} ){
  console.log("CharacterService.increment is processing the form...")
  const update = {}

  update['$inc'] = incrementForm
  update['$set'] = setForm
  update['$push'] = pushForm

  const levelUpdate = await updateSkillLevel(character, update)
    if(levelUpdate){
      update['$set'] = { ...update['$set'], ...levelUpdate }
    }
  try {
    const characterDB = await Character.findOneAndUpdate(
      {characterName: character},
      update,
      { 
        //new: true,
        upsert: true // only for dev, to not delete, recreate database
       }
      )
    if (pushForm['items']){
      await itemUpdate(character, pushForm['items'])
    }
  } catch (error) {
    console.log(error)
  }
  
  senderMediator.publish('update_char', {character: character, msg: update})
}

async function itemUpdate(character, itemIds){
  const items = await Item.find({'_id': {$in: itemIds}})
  senderMediator.publish('items', {character: character, msg: {items: items} })
}

/**
 * Finds the fields where exp was incremented and updates the corresponding level fields.
 * 
 * @param {String} character 
 * @param {*} update The update object used by mongoose
 * @returns An object to use in mongoose '$set' to update the levels of a character
*/
async function updateSkillLevel(character, update){
  let needsUpdate = false
  
  // filter for skill exp fields
  const incFields = update['$inc']
  const expChanged = Object.keys(incFields).filter(field => field.includes('skills') && field.includes('exp'));
  //filter for char exp
  const charExpChanged = incFields['exp'];
  // early return if exp is not changed
  if (!expChanged && !charExpChanged) {
    return null
  }

  const characterDB = await findCharacter(character)
  levelUpdate = {}
  
  if (expChanged){
    for (const field of expChanged){
      const current_exp = getFieldValue(characterDB, field) || 0;
      const increment_exp = incFields[field]
      const total_exp = current_exp + increment_exp
      console.log(`LevelUpdate: ${field}: {current: ${current_exp}, inc: ${increment_exp}, exp: ${total_exp}}`)
      // level you should be with the given exp
      const lvl = GatheringExpTable.getLevel(total_exp)
      const levelField = field.replace('exp', 'level')
      // the current level. if the fields does not exist it is 0.
      const currentLevel = getFieldValue(characterDB, levelField) || 0
      if (currentLevel !== lvl) {
        levelUpdate[levelField] = lvl
        let skillFieldPath = levelField.split('.')
        skillFieldPath.pop()
        skillFieldPath = skillFieldPath.join('.')
        levelUpdate[`${skillFieldPath}.speed`] = GatheringExpTable.getSpeed(lvl)
        levelUpdate[`${skillFieldPath}.luck`] = GatheringExpTable.getLuck(lvl)
        needsUpdate = true
      }
    }
  }

  if (charExpChanged){
    const currentCharExp = getFieldValue(characterDB, 'exp') || 0
    const currentLevel = getFieldValue(characterDB, 'level') || 0
    const total_CharExp = currentCharExp + charExpChanged

    const lvl = GatheringExpTable.getLevel(total_CharExp)
    if (currentLevel !== lvl) {
      levelUpdate['level'] = lvl
      needsUpdate = true
    }
  }
    if (needsUpdate) {
      return levelUpdate
    }
}


async function updateActionManager(character, update){
  await Character.findOneAndUpdate(
    { characterName: character },
    update,
    { new: true }
  )

  senderMediator.publish('actionManager', {character: character, msg: update})
}

async function getAll(){
  return await Character.find()
}

/**
 * 
 * @param {String} charName 
 * @returns 
 */
async function findCharacter(charName){
  const character =  await Character.findOne({ characterName: charName })
  const populate = character.populate('items')
  return populate
}

/**
 * 
 * @param {mongoose.Document} doc the mongoose document
 * @param {String} fieldPath the path as a string connected by '.'
 * @returns undefined if path does not exist, otherwise the value of the fieldPath
 */
function getFieldValue(doc, fieldPath) {
  const fieldParts = fieldPath.split('.');
  // traversing down the fieldPath
  let value = doc;
  for (const part of fieldParts) {
    console.log("CharacterService field access: traversing... " + part)
      if (true) {
          value = value[part];
      } else {
        console.log("CharacterService field access: Invalid field: " + part);
        return null
      }
  }

  return value;
}

/**
 * 
 * @param {String} character 
 * @param {String} skill 
 * @returns 
 */
async function getSkill(character, skill){
  const select = `skills.${skill}`
  const characterSkill = await Character.findOne({characterName: character}, select).lean()
  
  const skillSheet = {
    level: characterSkill.skills?.[skill]?.level || 0,
    luck: characterSkill.skills?.[skill]?.luck || 0,
    speed: characterSkill.skills?.[skill]?.speed || 0,
    yieldMax: 0,
    yieldMin: 0,
    exp:  0,
  }
  
  const toolID = characterSkill.skills?.[skill]?.equipment?.tool
  if (toolID) {
    // If toolId exists, add stats to the skillsheet
    const tool = await Item.findById(toolID)

    skillSheet.speed += (tool.properties?.speed || 0) / 100
    skillSheet.speed += (tool.properties?.speedBonus || 0) / 100
    skillSheet.yieldMax += (tool.properties?.yieldMax || 0)
    skillSheet.exp += (tool.properties?.expBonus || 0) / 100

    skillSheet.luck += tool.properties?.luckBonus || 0
  }

  
  return skillSheet
}


/**
 * 
 * @param {String} character 
 * @param {String} skill 
 * @returns 
 */
async function getGatheringSkill(character, skill){
  const select = `skills.${skill}`
  const characterSkill = await Character.findOne({characterName: character}, select).lean()
  
  const skillSheet = {
    level: characterSkill.skills?.[skill]?.level || 0,
    luck: characterSkill.skills?.[skill]?.luck || 0,
    speed: characterSkill.skills?.[skill]?.speed || 0,
    yieldMax: 0,
    yieldMin: 0,
    expBonus:  0,
  }
  
  const toolID = characterSkill.skills?.[skill]?.equipment?.tool
  if (toolID) {
    // If toolId exists, add stats to the skillsheet
    const tool = await Item.findById(toolID)

    skillSheet.luck += (tool.properties?.luckBonus || 0)
    skillSheet.speed += ((tool.properties?.baseSpeed || 0) * (1 + tool.properties?.speedBonus) )
    skillSheet.yieldMax += (tool.properties?.yieldMax || 0)
    skillSheet.expBonus += (tool.properties?.expBonus || 0)
  }
  return skillSheet
}

/**
 * 
 * @param {String} character 
 * @param {String} skill 
 * @returns 
 */
async function getCraftingSkill(character, skill){
  const select = `skills.${skill}`
  const characterSkill = await Character.findOne({characterName: character}, select).lean()
  
  const skillSheet = {
    level: characterSkill.skills?.[skill]?.level || 0,
    luck: characterSkill.skills?.[skill]?.luck || 0,
    speed: characterSkill.skills?.[skill]?.speed || 0,
    expBonus:  0,
  }
  
  const toolID = characterSkill.skills?.[skill]?.equipment?.tool
  if (toolID) {
    // If toolId exists, add stats to the skillsheet
    const tool = await Item.findById(toolID)

    skillSheet.luck += (tool.properties?.luckBonus || 0)
    skillSheet.speed += ((tool.properties?.baseSpeed || 0) * (1 + tool.properties?.speedBonus) )
    skillSheet.expBonus += (tool.properties?.expBonus || 0)
  }
  return skillSheet
}

/**
 * 
 * @param {String} character 
 * @param {String} skill 
 * @returns 
 */
async function getEnchantingSkill(character, skill){
  const select = `skills.${skill}`
  const characterSkill = await Character.findOne({characterName: character}, select).lean()
  
  const skillSheet = {
    level: characterSkill.skills?.[skill]?.level || 0,
    luck: characterSkill.skills?.[skill]?.luck || 0,
    speed: characterSkill.skills?.[skill]?.speed || 0,
    expBonus:  0,
  }
  
  const toolID = characterSkill.skills?.[skill]?.equipment?.tool
  if (toolID) {
    // If toolId exists, add stats to the skillsheet
    const tool = await Item.findById(toolID)

    skillSheet.luck += (tool.properties?.luckBonus || 0)
    skillSheet.speed += ((tool.properties?.baseSpeed || 0) * (1 + tool.properties?.speedBonus) )
    skillSheet.expBonus += (tool.properties?.expBonus || 0)
  }
  return skillSheet
}

async function equipSkillItem(character, itemID, skillName, slotType){

  let update = {}

  update['$set'] = {
    [`skills.${skillName}.equipment.${slotType}`]: itemID,
  };

  const options = {
    upsert: true, // only for dev, to not delete, recreate database
  };
  await Character.findOneAndUpdate(
    { characterName: character },
    update,
    options
  )
  senderMediator.publish('update_char', {character: character, msg: update})
  
  if (itemID){
    // if the item exists, bind the item
    let updateItem = {}
    updateItem['$set'] = {['soulbound']: true}
    const item = await Item.findByIdAndUpdate(
      itemID,
      updateItem,
      { new: true }
    )
    if(item) {
      senderMediator.publish('items', {character: character, msg: {items: [item]} })
    }
  }
}

async function getAllItemsFromCharacter(character) {
  const select = 'items';

  const characterData = await Character.findOne({ characterName: character }, select).lean();

  // Extract the ObjectIds from the array as strings
  const itemIds = characterData.items.map(item => String(item._id));
  return itemIds;
}

async function getItem(item_id){
  const item = await Item.findById(item_id)

  return item
}

async function getActiveAction(character){
  const char = await Character.findOne({characterName: character}).lean()

  const currentAction = char.currentAction

  let runningActionName = ""

  if(currentAction){
    runningActionName = currentAction.actionType
  }

  return runningActionName
}

module.exports = {increment, getSkill, findCharacter, getFieldValue,getGatheringSkill,getCraftingSkill,getEnchantingSkill, updateActionManager, getAll, getItem, equipSkillItem, getAllItemsFromCharacter, getActiveAction, itemUpdate}