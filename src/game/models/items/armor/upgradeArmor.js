const Armor = require('./armor')
const { rollRange, weightedChoiceRemoved } = require('../../../utils/randomDice');
const { getRarityNumber } = require('../itemUtils');
const { resourcesInfo } = require('../../../data/resourceDetails/resourcesInfo');
const { gearScoreData } = require('../../../utils/dataLoader')

/**
 * 
 * @param {Number} tier 
 * @param {String} rarity 
 * @returns {Number}
 */
function getArmorStat(tier, rarity) {
  const armorStat = upgradeData.toolSpeed
  // Access the values from the two-dimensional array
  const min = armorStat[tier - 1][getRarityNumber(rarity)]
  const max = armorStat[tier - 1][getRarityNumber(rarity) + 1]
  
  // Roll a random number within the specified range
  return rollRange(min, max)
}

/**
 * @param {Armor} armor
 * @param {[String]} selectedResources
 */
function getGearScore(armor, selectedResources){
  console.log("getGearScore...");
  const gearScoreTierRarity = gearScoreData.gearScoreTable;

  const tier = armor.tier -1 // need to index tier1 as 0, tier5 is 4
  const rarityNumber = getRarityNumber(armor.rarity)


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
 * 
 * @param {Armor} armor 
 * @param {[String]} selectedResources 
 */
function applyBonus(armor, recipe, selectedResources){
  console.log("applyBonus...")
  const maxBoniCount = armor.tier

  const gearScore = getGearScore(armor, selectedResources)
  console.log("applyBonus: ", gearScore)
  armor.properties.totalGearScore = gearScore
  
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

  // apply the boni to the armor. randomly distribute the gearScore across all the bonus
  let rest = gearScore
  while (rest > 0){
    if (!rolledBonus) break
    for (const bonusType of rolledBonus) {
      if (rest <= 0) break;

      const bonusValue = rollRange(1, rest);
      rest -= bonusValue

      // Initialize to 0 if the property does not exist
      armor.properties.gearScores[bonusType] ??= 0;
      armor.properties.gearScores[bonusType] += bonusValue;
    };
  }
}

/**
 * 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeArmor(recipe, selectedUpgrades, characterSkill){
  const recipeName = recipe["name"];
  console.log("upgradeArmor: ...", recipeName);
  const equipmentType = recipe["equipmentType"]
  const equipmentSkills = recipe["equipmentSkills"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

  // find the item to upgrade and get the rarity
  const rarity = selectedUpgrades.find(string => string.includes(recipeName)).split("_")[1]
  // get base speed
  //const armorStat = getArmorStat(tier, rarity)
  //const resistanceStat = getArmorStat(tier, rarity)
  
  // craft item

  const armor = new Armor(recipeName, equipmentType, equipmentSkills, level, tier, rarity)
  applyBonus(armor, recipe, selectedUpgrades)

  console.log(armor)

  const item = await armor.save()
  console.log("upgradeArmor: ", item );

  return item._id
}

module.exports = {upgradeArmor}