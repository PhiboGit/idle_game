const Armor = require('./armor')
const { rollRange, weightedChoiceRemoved} = require('../../../utils/randomDice')
const {getRarityNumber, rarityEvents} = require('../itemUtils')
const {getCraftingMaterials} = require('../../../data/resourceDetails/craftingMaterials')
const { upgradeData } = require('../../../utils/dataLoader')

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
 * 
 * @param {Armor} armor 
 * @param {[String]} selectedResources 
 */
function applyBonus(armor, selectedResources){
  const maxBoniCount = getRarityNumber(armor.rarity) + 1
  

  // available bonus stats for this armor
  const gatheringBonuses = upgradeData.gatheringBonuses; // speed, exp, yield, luck
  const stats = armor.equipmentSkills.map(skill => upgradeData.skillToStatsMap[skill]); // each skill has only one stat
  // only one random stat
  const rolledStats = weightedChoiceRemoved(stats, 1)
  const bonuses = [...gatheringBonuses, ...rolledStats];  // all available boni


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

  // apply the boni to the armor
  rolledBonus.forEach(bonusType => {
    const bonusValue = bonusValues[bonusType][getRarityNumber(armor.rarity)];
    armor.properties[bonusType] = bonusValue;
  });
}

/**
 * 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeArmor(recipe, selectedUpgrades, characterSkill){
  const name = recipe["name"]
  const equipmentType = recipe["equipmentType"]
  const equipmentSkills = recipe["equipmentSkills"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

  // find the item to upgrade and get the rarity
  const rarity = selectedUpgrades.find(string => string.includes(name)).split("_")[1]
  // get base speed
  const armorStat = getArmorStat(tier, rarity)
  const resistanceStat = getArmorStat(tier, rarity)
  
  // craft item

  const armor = new Armor(name, equipmentType, equipmentSkills, level, tier, rarity, resistanceStat, armorStat)
  applyBonus(armor, selectedUpgrades)

  console.log(armor)

  const itemDB = await armor.save()

  return itemDB._id
}

module.exports = {upgradeArmor}