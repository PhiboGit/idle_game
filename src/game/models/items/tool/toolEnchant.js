const Tool = require('./tool')
const {weightedChoice} = require('../../../utils/randomDice')
const {getRarityNumber} = require('../itemUtils')


const chancesEvents = [-2, -1, 1, 2, 3]
const enchantingBonus = [
  [20, 30, 10 , 40,  0 ],// com
  [15, 35, 10 , 35, 5 ],// unc
  [10, 35, 15 ,30, 10 ],// rar
  [ 5, 35, 20 ,30, 15 ],// epi
  [ 5, 25, 20 ,30, 20 ],// leg
]

/**
 * 
 * @param {Tool} tool 
 * @param {String} enchantingResource 
 * @param {*} characterSkill 
 */
async function enchantTool(tool, enchantingResource, characterSkill){
  console.log("enchant tool...", tool)
  const currentEnchantingLevel = tool.enchantingLevel
  const rarity = enchantingResource.split('_')[1];
  let chances = enchantingBonus[getRarityNumber(rarity)]
  chances[0] = Math.max(0, chances[0] - Math.floor(characterSkill.level / 20) + Math.floor(currentEnchantingLevel / 2)) // -2 enchanting level
  chances[1] = Math.max(0, chances[1] - Math.floor(characterSkill.level / 10) + Math.floor(currentEnchantingLevel / 2)) // -1 enchanting level
  chances[2] = Math.max(0, chances[2] + Math.floor(characterSkill.level / 1)  - Math.floor(currentEnchantingLevel / 2)) //  1 enchanting level
  chances[3] = Math.max(0, chances[3] + Math.floor(characterSkill.level / 25) - Math.floor(currentEnchantingLevel / 2)) //  2 enchanting level
  chances[4] = Math.max(0, chances[4] + Math.floor(characterSkill.level / 50) - Math.floor(currentEnchantingLevel / 2)) //  3 enchanting level

  console.log("Enchanting chances: ", chances)
  const roll = weightedChoice(chancesEvents, 1, chances)[0]
  console.log("Enchanting roll: ", roll)

  tool.enchantingLevel = Math.max(0, currentEnchantingLevel + roll)
  console.log("enchant tool: ", tool)
  await tool.save()
}

module.exports = {enchantTool}