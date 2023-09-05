const dataLoader = require('../utils/dataLoader')

const expTable = dataLoader.gatheringEXPData

/**
 * Return the level you are with the given exp
 * 
 * @param {Number} exp 
 * @returns {Number}
 */
function getLevel(exp){
  let level = 0;
  table = expTable['Exp (total)']
  for (const levelStr in table) {
      const expRequired = table[levelStr]
      if (exp >= expRequired) {
          level = parseInt(levelStr)
      } else {
          break
      }   
  }
  return level
}

/**
 * 
 * @param {Number} level 
 * @returns {Number}
 */
function getLuck(level) {
  table = expTable['Luck']
  return table[level]
}

/**
 * 
 * @param {Number} level 
 * @returns {Number}
 */
function getSpeedBonus(level) {
  table = expTable['Gathering Speed Bonus']
  return table[level]
}

module.exports = {getLevel, getSpeedBonus, getLuck}