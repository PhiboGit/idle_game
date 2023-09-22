const Globals = require('../utils/globals')
const CharacterService = require('../models/services/characterService')
const {rollDice} = require('../utils/randomDice')

/**
 * 
 * @param {String} character 
 * @param {Number} characterSkillLevel 
 * @param {Number} requiredLevel 
 */
async function validateLevel(character, characterSkillLevel, requiredLevel) {

  if (characterSkillLevel < requiredLevel) {
    console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`);
    throw new Error('level');
  }
}

module.exports = {Globals, CharacterService, rollDice, validateLevel}