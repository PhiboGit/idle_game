const {weightedChoice, adjustWeights} = require('../../utils/randomDice')
const {getCraftingMaterials} = require('../../data/resourceDetails/craftingMaterials')
const {rarityEvents} = require('./itemUtils')



  /**
   * 
   * @param {Number} skillLevel 
   * @param {[String]} selectedResources 
   * @returns 
   */
function getRarity(skillLevel, selectedResources){
  const rarityWeights = [8000, 1500, 400, 90, 10] // 0 - 10000; 1 = 0.001
  const defaultWindow = [0, 2000]

  // at level 75 the endWindow is 0, unlocks uncommon, rare,... later
  let endWindow = defaultWindow[1] - Math.floor(defaultWindow[1] * (Math.min(75, skillLevel) / 75 ))
  let startWindow = defaultWindow[0] + Math.min(2000, 16 * Math.max(0, skillLevel - 75))
  
  for (const selectedItem of selectedResources) {
    const item = getCraftingMaterials(selectedItem)
    if (!item) continue
    if (item["craftingBonus"]){
      startWindow += item["craftingBonus"]
    }
  }
  console.log("Weights: " + rarityWeights)
  console.log("Window: " + defaultWindow[0] + " " + defaultWindow[1])
  
  // get rarity
  console.log("Window: " + startWindow + " " + endWindow)
  const weights = adjustWeights(rarityWeights, startWindow, endWindow)
  console.log("Weights: " + weights)
  const rarity = weightedChoice(rarityEvents, 1, weights)[0]
  return rarity
}

/**
 * 
 * @param {String} recipeName 
 * @param {*} recipe 
 * @param {[String]} selectedIngredients 
 * @param {*} characterSkill 
 * @returns {String}
 */
function craft(recipeName, recipe, selectedIngredients, characterSkill){
  const type = recipe["type"]
  const subtype = recipe["subtype"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck
  
  
  const rarity = getRarity(skillLevel, selectedIngredients)

  return `${recipeName}_${rarity}`
}

module.exports = {craft}