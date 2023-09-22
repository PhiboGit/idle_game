const { default: mongoose } = require('mongoose')

const Character = require('../character')
const GatheringExpTable = require('../../data/gatheringExpTable')

const {senderMediator} = require('../../../routes/websocket/mediator')


/**
 * Increments the characters values and updates the database.
 * It also updates the level when exp was incremented.
 * 
 * @param {String} character 
 * @param {Object} form 
 */
async function increment(character, form){
  console.log("CharacterService.increment is processing the form...")
  const update = {}

  update['$inc'] = form

  const levelUpdate = await updateSkillLevel(character, update)
    if(levelUpdate){
      update['$set'] = levelUpdate
    }
  try {
    const characterDB = await Character.findOneAndUpdate(
      {characterName: character},
      update,
      { new: true }
      )
  } catch (error) {
    console.log(error)
  }
  
  senderMediator.publish('update_char', {character: character, msg: update})
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
      const current_exp = getFieldValue(characterDB, field);
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
    const currentCharExp = getFieldValue(characterDB, 'exp')
    const total_CharExp = currentCharExp + charExpChanged

    const lvl = GatheringExpTable.getLevel(total_CharExp)
    levelUpdate['level'] = lvl
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
  const character =  await Character.findOne({ characterName: charName }).lean()
  return character
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
      if (value && value.hasOwnProperty(part)) {
          value = value[part];
      } else {
        console.log("CharacterService field access: Invalid field " + part);
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

  const defaultSkill = {
      exp: characterSkill.skills?.[skill]?.exp || 0,
      level: characterSkill.skills?.[skill]?.level || 0,
      luck: characterSkill.skills?.[skill]?.luck || 0,
      speed: characterSkill.skills?.[skill]?.speed || 0,
    }
  return defaultSkill
}



module.exports = {increment, getSkill, findCharacter, getFieldValue, updateActionManager, getAll}