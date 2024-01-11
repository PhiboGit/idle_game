const GatheringTool = require('./gatheringTool');
const { rollRange, weightedChoiceRemoved } = require('../../../../utils/randomDice');
const { getRarityNumber } = require('../../itemUtils');
const { getCraftingMaterials } = require('../../../../data/resourceDetails/craftingMaterials');
const { upgradeData } = require('../../../../utils/dataLoader')

/**
 * @param {Number} tier
 * @param {String} rarity
 * @returns {Number}
 */
function getBaseSpeed(tier, rarity) {
  const toolSpeed = upgradeData.toolSpeed;
  const min = toolSpeed[tier - 1][getRarityNumber(rarity)];
  const max = toolSpeed[tier - 1][getRarityNumber(rarity) + 1];
  return rollRange(min, max);
}

/**
 * @param {GatheringTool} tool
 * @param {[String]} selectedResources
 */
function applyBonus(tool, selectedResources) {
  const maxBoniCount = getRarityNumber(tool.rarity)
  
  // available bonus stats for this armor
  const gatheringBonuses = upgradeData.gatheringBonuses; // speed, exp, yield, luck
  const stats = tool.equipmentSkills.map(skill => upgradeData.skillToStatsMap[skill]); // each skill has only one stat
  const bonuses = [...gatheringBonuses, ...stats];  // all available boni


  // lookup for the values of the bonus
  const bonusValues = upgradeData.bonusCharmValues;

  // bonus are not random if a charm is used
  let rolledBonus = [];
  for (const bonusCharm of selectedResources) {
    // translate the charm name to a bonus
    const bonusType = upgradeData.charmToBonusMap[bonusCharm];
    if (bonusType) {
      rolledBonus.push(bonusType);
    }
  }

  // remove the pre selected boni from the random roll pool
  const filteredBonuses = bonuses.filter(bonus => !rolledBonus.includes(bonus));
  // roll boni to apply
  rolledBonus = rolledBonus.concat(weightedChoiceRemoved(filteredBonuses, maxBoniCount - rolledBonus.length));
  console.log("rolledBonus", rolledBonus);

  // apply the boni to the tool
  rolledBonus.forEach(bonusType => {
    const bonusValue = bonusValues[bonusType][getRarityNumber(tool.rarity)];
    tool.properties[bonusType] = bonusValue;
  });
}

/**
 * @param {*} recipe
 * @param {[String]} selectedUpgrades
 * @param {*} characterSkill
 * @returns
 */
async function upgradeGatheringTool(recipe, selectedUpgrades, characterSkill) {
  const recipeName = recipe["name"];
  const equipmentSkills = recipe["equipmentSkills"];
  const tier = recipe["tier"];
  const level = recipe["equipLevel"];

  const skillLevel = characterSkill.level;
  const skillLuck = characterSkill.luck;
  const rarity = selectedUpgrades.find(str => str.includes(recipeName))?.split("_")[1];
  const baseSpeed = getBaseSpeed(tier, rarity);

  const tool = new GatheringTool(recipeName, equipmentSkills, level, tier, rarity, baseSpeed);
  applyBonus(tool, selectedUpgrades);
  console.log(tool);

  const toolDB = await tool.save();
  return toolDB._id;
}

module.exports = { upgradeGatheringTool };