const { default: mongoose } = require('mongoose')

const Character = require('../character')
const GatheringExpTable = require('../../data/gatheringExpTable')
const {CharacterForm_Incremental, getUpdate_IncObject} = require('../../models/characterForm')
const {getSkillForm, SkillForm} = require('../skills')


/**
 * Increments the characters values and updates the database.
 * It also updates the level when exp was incremented.
 * 
 * @param {String} name 
 * @param {CharacterForm_Incremental} form 
 */
async function increment(name, form){
  console.log("CharacterService.increment is processing the form...")
  const update = {}

  const incObject = getUpdate_IncObject(form)
  update['$inc'] = incObject

  const levelUpdate = await updateLevel(name, update)
    if(levelUpdate){
      update['$set'] = levelUpdate
    }
  try {
    const character = await Character.findOneAndUpdate(
      {characterName: name},
      update,
      { new: true }
      )
  } catch (error) {
    console.log(error)
  }
  
}

/**
 * Finds the fields where exp was incremented and updates the corresponding level fields.
 * 
 * @param {String} name 
 * @param {*} update The update object used by mongoose
 * @returns An object to use in mongoose '$set' to update the levels of a character
 */
async function updateLevel(name, update){
  let needsUpdate = false

  // filter for exp fields
  const incFields = update['$inc']
  const expChanged = Object.keys(incFields).filter(field => field.includes('skills') && field.includes('exp'));
  // early return if exp is not changed
  if (!expChanged) {
    return null
  }

  try {
    const character = await findCharacter(name)

    levelUpdate = {}
    for (const field of expChanged){
      const current_exp = getFieldValue(character, field);
      const increment_exp = incFields[field]
      const total_exp = current_exp + increment_exp
      console.log(`LevelUpdate: ${field}: {current: ${current_exp}, inc: ${increment_exp}, exp: ${total_exp}}`)
      // level you should be with the given exp
      const lvl = GatheringExpTable.getLevel(total_exp)
      const levelField = field.replace('exp', 'level')
      // the current level. if the fields does not exist it is 0.
      const currentLevel = getFieldValue(character, levelField) || 0
      if (currentLevel !== lvl) {
        levelUpdate[levelField] = lvl
        needsUpdate = true
      }
    }
    if (needsUpdate) {
      return levelUpdate
    }
  } catch (error) {
    console.log(error)
  }  
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
        return undefined
      }
  }

  return value;
}

/**
 * 
 * @param {String} name 
 * @param {String} skill 
 * @returns {SkillForm}
 */
async function getSkill(name, skill){
  const select = `skills.${skill}`

  const characterSkill = await Character.findOne({characterName: name}, select).lean()
  const skillForm = getSkillForm(characterSkill.skills?.[skill])
  return skillForm
}

module.exports = {increment, getSkill, findCharacter}