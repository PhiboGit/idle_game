const { upgradeArmor } = require('./armor/upgradeArmor');
const {upgradeGatheringTool} = require('./tool/gatheringTool/gatheringToolUpgrade')

/**
 * 
 * @param {String} recipeName 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeItem(recipeName, recipe, selectedUpgrades, characterSkill) {
  if (recipe.type === "tool" && recipe.skills.some(skill => ["woodcutting", "mining", "harvesting"].includes(skill))) {
    return await upgradeGatheringTool(recipeName, recipe, selectedUpgrades, characterSkill);
  } else if (["head", "chest", "hands", "legs", "feet"].includes(recipe.type)) {
    return await upgradeArmor(recipeName, recipe, selectedUpgrades, characterSkill);
  } else {
    console.error("can not find upgrade: ", recipe.type);
  }
}

module.exports = {upgradeItem}