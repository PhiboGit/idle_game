const { default: mongoose } = require('mongoose')

const Character = require('../character')
const Item = require('../item')
const GatheringExpTable = require('../../data/gatheringExpTable')

const { getSkillSheetForGearScore } = require('../items/gearScoreConverter')

const {senderMediator} = require('../../../routes/websocket/mediator')


/**
 * Increments the characters values and updates the database.
 * It also updates the level when exp was incremented.
 * 
 * @param {String} character 
 * @param {Object} form 
 */
async function increment(character, incrementForm = {}, setForm= {}, pushForm={}, pullForm={} ){
  console.log("CharacterService.increment is processing the form...")
  const update = {}

  update['$inc'] = incrementForm
  update['$set'] = setForm
  update['$push'] = pushForm
  update['$pull'] = pullForm

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
        upsert: false // only for dev; to not delete/recreate database; able to add new items to the inventory
       }
      )
    if (pushForm['items']){
      // notify the user about the new item
      await itemUpdate(character, pushForm['items'])
    }
  } catch (error) {
    console.log(error)
  }
  
  senderMediator.publish('update_char', {character: character, msg: update})
}

async function itemUpdate(character, itemId){
  const item = await Item.findById(itemId).lean()
  senderMediator.publish('item_update', {character: character, msg: {item: item} })
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
  const character =  await Character.findOne({ characterName: charName }).
    populate('items').
    populate('orders').
    populate({
      path: 'itemOrders',
      // Get item of order - populate the 'item' array for every order
      populate: { path: 'item' }
    }).
    exec();
  return character
}

/**
 * 
 * @param {mongoose.Document} doc the mongoose document
 * @param {String} fieldPath the path as a string connected by '.'
 * @returns undefined if path does not exist, otherwise the value of the fieldPath
 */
function getFieldValue(doc, fieldPath) {
  const resolvePath = (object, path, defaultValue) => path
    .split('.')
    .reduce((o, p) => o ? o[p] : defaultValue, object)

  const value = resolvePath(doc, fieldPath, undefined)
  console.log("CharacterService fieldValue:", fieldPath, value )

  return value;
}


/**
 * Get skill data for a character and skill.
 * @param {String} character characterName
 * @param {String} skill name of the skill/profession
 * @returns skillData
 */
async function getSkillData(character, skill) {
  const select = `skills.${skill}`;
  const characterSkill = await Character.findOne({ characterName: character }, select).lean();

  // the skill sheet, not every skill has/uses every entry, therefore some are 0
  const skillSheet = {
    level: characterSkill.skills?.[skill]?.level || 0,
    luck: characterSkill.skills?.[skill]?.luck || 0,

    speed: 0,
    yieldMax: 0,
    yieldMin: 0,
    expBonus: 0,
  };

  // iterate over all the equipment items
  const equipmentTypes = ['tool', 'head', 'chest', 'hands', 'legs', 'feet'];
  // Use Promise.all to wait for all asynchronous operations to complete
  await Promise.all(
    equipmentTypes.map(async (type) => {
      const equipmentID = characterSkill.skills[skill].equipment[type];
      if (equipmentID) {
        const item = await Item.findById(equipmentID);

        const itemSkillSheet = getSkillSheetForGearScore(skill, item)

        skillSheet.luck += itemSkillSheet.luck;
        skillSheet.speed += itemSkillSheet.speed;
        skillSheet.expBonus += itemSkillSheet.exp
        skillSheet.yieldMax += itemSkillSheet.yieldMax
        skillSheet.yieldMin += itemSkillSheet.yieldMin || 0;
      }
    })
  );
  
  // some values need adjustments, eg. percentage values
  skillSheet.speed = skillSheet.speed / 100
  skillSheet.expBonus = skillSheet.expBonus / 100
  
  console.log("SkillData: ", skillSheet)
  return skillSheet;
}


async function equipItem(character, itemId, skillName, slotType){
  console.log("equipItem: ...")
  let update = {}
  update['$set'] = {
    [`skills.${skillName}.equipment.${slotType}`]: itemId,
  };
  
  await Character.findOneAndUpdate(
    { characterName: character },
    update,
  )
  senderMediator.publish('update_char', {character: character, msg: update})
  
  if (itemId){
    // if the item exists, bind the item
    let updateItem = {}
    updateItem['$set'] = {['soulbound']: true}
    const item = await Item.findByIdAndUpdate(
      itemId,
      updateItem,
      { new: true }
    )
    if(item) {
      senderMediator.publish('item_update', {character: character, msg: {item: item} })
    }
  }
}

async function isItemEquiped(character, itemId) {
  console.log("isItemEquiped: ...")
  const item = await getItem(itemId)
  const characterDB = await findCharacter(character)
  const itemSlot = item.equipmentType


  let found = false
  for (const itemSkill of item.equipmentSkills) {
    //check if the item is at a valid skill equiped
    const equipedItemId = characterDB.skills[itemSkill].equipment[itemSlot]
    if (equipedItemId == itemId){
      console.log("Equipment item id: ", equipedItemId)
      found = true
    }
  }
  console.log("isItemEquiped:", found)
  
  return found
}


async function getAllItemsFromCharacter(character) {
  const select = 'items';

  const characterData = await Character.findOne({ characterName: character }, select).lean();

  // Extract the ObjectIds from the array as strings
  const itemIds = characterData.items.map(item => String(item._id));
  return itemIds;
}

async function getItem(itemId){
  const item = await Item.findById(itemId)

  return item
}

async function deleteItem(itemId){
  await Item.findByIdAndDelete(itemId)
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

module.exports = {increment, isItemEquiped,deleteItem, findCharacter, getFieldValue,getSkillData, updateActionManager, getAll, getItem, equipItem, getAllItemsFromCharacter, getActiveAction, itemUpdate}