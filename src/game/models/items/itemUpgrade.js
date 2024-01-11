const { upgradeArmor } = require('./armor/upgradeArmor');
const {upgradeGatheringTool} = require('./tool/gatheringTool/gatheringToolUpgrade')

/**
 * 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeItem(recipe, selectedUpgrades, characterSkill) {
  // call upgrade based on equipmentType and equipmentSkill of recipe
  if (recipe.equipmentType === "tool" && recipe.equipmentSkills.some(skill => ["woodcutting", "mining", "harvesting"].includes(skill))) {
    return await upgradeGatheringTool(recipe, selectedUpgrades, characterSkill);
  } else if (["head", "chest", "hands", "legs", "feet"].includes(recipe.equipmentType)) {
    return await upgradeArmor(recipe, selectedUpgrades, characterSkill);
  } else {
    console.error("can not find upgrade: ", recipe.equipmentType);
  }
}

module.exports = {upgradeItem}