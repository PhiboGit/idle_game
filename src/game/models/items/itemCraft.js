const {getCraftingMaterials} = require('../../data/resourceDetails/craftingMaterials')
const {getRarityEquipment} = require('../../data/craftingTable')


/**
 * 
 * @param {Number} skillLevel 
 * @param {[String]} selectedResources 
 * @returns 
*/
function getRarity(skillLevel, itemLevel, selectedResources){
  let startBonus = 0
  let endBonus = 0
  
  for (const selectedItem of selectedResources) {
    const item = getCraftingMaterials(selectedItem)
    if (!item) continue
    if (item["craftingBonus"]){
      startBonus += item["craftingBonus"]
    }
  }
  
  const rarity = getRarityEquipment(skillLevel, itemLevel, startBonus, endBonus)
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
  const tier = recipe["tier"]
  const itemLevel = recipe["level"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck
  
  
  const rarity = getRarity(skillLevel, itemLevel, selectedIngredients)

  return `${recipeName}_${rarity}`
}

module.exports = {craft}