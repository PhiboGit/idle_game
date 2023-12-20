const {upgradeGatheringTool} = require('./tool/gatheringTool/gatheringToolUpgrade')

/**
 * 
 * @param {String} recipeName 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeItem(recipeName, recipe, selectedUpgrades, characterSkill){
  switch (recipe.type) {
    case "tool":
      switch (recipe.subtype) {
        case "gathering":
          return await upgradeGatheringTool(recipeName, recipe, selectedUpgrades, characterSkill)
         
        default:
          break;
      }
      break;
    
    default:
      break;
  }
}

module.exports = {upgradeItem}