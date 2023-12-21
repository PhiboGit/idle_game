const Armor = require('./armor')
const { rollRange, weightedChoiceRemoved} = require('../../../utils/randomDice')
const {getRarityNumber, rarityEvents} = require('../itemUtils')
const {getCraftingMaterials} = require('../../../data/resourceDetails/craftingMaterials')

/**
 * 
 * @param {Number} tier 
 * @param {String} rarity 
 * @returns {Number}
 */
function getArmorStat(tier, rarity) {
  const armorStat = [
// com, unc, rar, epi, leg, max
  [  0,   5,  10,  20,  30,  50], //T1
  [  5,  20,  45,  60,  75, 100], //T2
  [ 20,  45,  70,  95, 120, 150], //T3
  [ 45,  70, 100, 130, 160, 200], //T4
  [ 70, 100, 140, 180, 220, 300], //T5
];
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
  const gatheringBonuses = ['speed', 'luck', 'yield', 'exp']
  const stats = ["str", "con", "int", "dex", "foc"]
  

  const bonuses = [...gatheringBonuses, ...stats] 

  const statBonus = [1,2,3,4,5]
  const armorBonus = {
    "stat": statBonus,

    "speed":
    //com,  unc,  rar,  epi,  leg
    [0.10, 0.20, 0.33, 0.66, 1.00],
    "luck":
    //com,  unc,  rar,  epi,  leg
    [500, 1000, 1500, 2000, 2500],
    "yield":
    //com, unc, rar, epi, leg
    [  1,   2,   3,   4,  5],
    "exp": 
    //com, unc, rar, epi, leg
    [0.05,  0.10,  0.15,  0.20,  0.25]
  }
  const rarity = armor.rarity
  //get bonus
  let rolledBonus = []
  for (const bonusCharm of selectedResources) {
    switch (bonusCharm) {
      case "speedCharm":
         rolledBonus.push("speed")
        break;
      case "expCharm":
         rolledBonus.push("exp")
        break;
      case "yieldCharm":
         rolledBonus.push("yield")
        break;
      case "luckCharm":
         rolledBonus.push("luck")
        break;
      case "conCharm":
         rolledBonus.push("con")
        break;
      case "strCharm":
         rolledBonus.push("str")
        break;
      case "intCharm":
         rolledBonus.push("int")
        break;
      case "dexCharm":
         rolledBonus.push("dex")
        break;
      case "focCharm":
         rolledBonus.push("foc")
        break;
    
      default:
        break;
    }
  }
  // execlude selected bonus
  const filterdBonuses = bonuses.filter(bonus => !rolledBonus.includes(bonus))
  // roll the bonus
  rolledBonus = rolledBonus.concat(weightedChoiceRemoved(filterdBonuses, 1 + getRarityNumber(rarity) - rolledBonus.length))
  console.log( "rolledBonus" , rolledBonus)
  
  rolledBonus.forEach(bonus => {
    switch (bonus) {
      case 'speed':
        armor.properties.speedBonus = armorBonus.speed[getRarityNumber(rarity)];
      break;
        
      case 'luck':
        armor.properties.luckBonus = armorBonus.luck[getRarityNumber(rarity)];
        break;
        
      case 'yield':
        armor.properties.yieldMax = armorBonus.yield[getRarityNumber(rarity)];
        break;
          
      case 'exp':
        armor.properties.expBonus = armorBonus.exp[getRarityNumber(rarity)];
        break;

      case 'con':
        armor.properties.con = armorBonus.stat[getRarityNumber(rarity)];
        break;
      case 'str':
        armor.properties.str = armorBonus.stat[getRarityNumber(rarity)];
        break;
      case 'int':
        armor.properties.int = armorBonus.stat[getRarityNumber(rarity)];
        break;
      case 'dex':
        armor.properties.dex = armorBonus.stat[getRarityNumber(rarity)];
        break;
      case 'foc':
        armor.properties.foc = armorBonus.stat[getRarityNumber(rarity)];
        break;
              
      default:
        // Handle any unexpected bonus
        console.error(`Unknown bonus type: ${bonus}`);
    }
  })
}

/**
 * 
 * @param {String} recipeName 
 * @param {*} recipe 
 * @param {[String]} selectedUpgrades 
 * @param {*} characterSkill 
 * @returns 
 */
async function upgradeArmor(recipeName, recipe, selectedUpgrades, characterSkill){
  const name = recipe["name"]
  const type = recipe["type"]
  const skills = recipe["skills"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

  // find the item to upgrades and get the rarity
  const rarity = selectedUpgrades.find(string => string.includes(recipeName))?.split("_")[1]
  
  // get base speed
  const armorStat = getArmorStat(tier, rarity)
  const resistanceStat = getArmorStat(tier, rarity)
  
  // craft item

  const armor = new Armor(name, type, skills, level, tier, rarity, resistanceStat, armorStat)
  applyBonus(armor, selectedUpgrades)

  console.log(armor)

  const itemDB = await armor.save()

  return itemDB._id
}

module.exports = {upgradeArmor}