const GatheringTool = require('./gatheringTool');
const { rollRange, weightedChoiceRemoved } = require('../../../../utils/randomDice');
const { getRarityNumber } = require('../../itemUtils');
const { resourcesInfo } = require('../../../../data/resourceDetails/resourcesInfo');
const { gearScoreData, recipesData } = require('../../../../utils/dataLoader')

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
function getGearScore(tool, selectedResources){
  console.log("getGearScore...");
  const gearScoreTierRarity = gearScoreData.gearScoreTable;

  const tier = tool.tier -1 // need to index tier1 as 0, tier5 is 4
  const rarityNumber = getRarityNumber(tool.rarity)


  // the max gearScore for this tier
  const maxGearScore = gearScoreTierRarity[tier][5]
  // roll the gearScore based on rarity
  let baseGearScore = rollRange(gearScoreTierRarity[tier][rarityNumber], gearScoreTierRarity[tier][rarityNumber + 1])
  console.log("getGearScore: rolled ", baseGearScore);

  // check if upgrades were used and apply the gearScoreBonus
  for (const craftingMaterial of selectedResources) {
    const gearScoreBonus = resourcesInfo[craftingMaterial]?.gearScoreBonus
    if(gearScoreBonus){
      console.log("getGearScore: found a bonus ", gearScoreBonus);
      baseGearScore += gearScoreBonus
    }
  }
  
  // no higher gearScore than the maxGearScore value
  return Math.min(baseGearScore, maxGearScore);
}

/**
 * @param {*} recipe
 * @param {GatheringTool} tool
 * @param {[String]} selectedResources
 */
function applyBonus(recipe, tool, selectedResources) {
  console.log("applyBonus...")
  const maxBoniCount = tool.tier

  const gearScore = getGearScore(tool, selectedResources)
  console.log("applyBonus: ", gearScore)
  tool.properties.totalGearScore = gearScore
  
  // available bonus stats for this recipe
  const availableBoni = recipe.availableBoni; // speed, exp, yield, luck, str,...
  console.log("availableBoni", availableBoni);

  // bonus are not random if a charm is used
  let rolledBonus = [];
  for (const craftingMaterial of selectedResources) {
    const bonusType = resourcesInfo[craftingMaterial]?.charmType
    if(bonusType){
      rolledBonus.push(bonusType);
    }
  }
  console.log("preSelected Boni", rolledBonus);
  
  // remove the pre selected boni from the random roll pool
  const filteredBonuses = availableBoni.filter(bonus => !rolledBonus.includes(bonus));
  console.log("availableRandomBoni", filteredBonuses);
  const randomBoni = weightedChoiceRemoved(filteredBonuses, maxBoniCount - rolledBonus.length)
  console.log("randomBoni", randomBoni);
  // roll boni to apply
  rolledBonus = [...rolledBonus, ...randomBoni];
  console.log("rolledBonus", rolledBonus);

  // apply the boni to the tool. randomly distribute the gearScore across all the bonus
  let rest = gearScore
  while (rest > 0){
    if (!rolledBonus) break
    for (const bonusType of rolledBonus) {
      if (rest <= 0) break;

      const bonusValue = rollRange(1, rest);
      rest -= bonusValue

      // Initialize to 0 if the property does not exist
      tool.properties.gearScores[bonusType] ??= 0;
      tool.properties.gearScores[bonusType] += bonusValue;
    };
  }
}

/**
 * @param {*} recipe
 * @param {[String]} selectedUpgrades
 * @param {*} characterSkill
 * @returns
 */
async function upgradeGatheringTool(recipe, selectedUpgrades, characterSkill) {
  const recipeName = recipe["name"];
  console.log("upgradeGatheringTool: ...", recipeName);
  const equipmentSkills = recipe["equipmentSkills"];
  const tier = recipe["tier"];
  const level = recipe["equipLevel"];

  const skillLevel = characterSkill.level;
  const skillLuck = characterSkill.luck;
  // [1] selects the rarity that is behind the underscore "_"
  const rarity = selectedUpgrades.find(str => str.includes(recipeName))?.split("_")[1];

  const tool = new GatheringTool(recipeName, equipmentSkills, level, tier, rarity);
  console.log("upgradeGatheringTool: ...", tool);
  applyBonus(recipe, tool, selectedUpgrades);
  console.log(tool);

  const item = await tool.save();
  console.log("upgradeGatheringTool: ", item );
  return item._id;
}

module.exports = { upgradeGatheringTool };