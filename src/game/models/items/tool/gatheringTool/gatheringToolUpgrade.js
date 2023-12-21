const GatheringTool = require('./gatheringTool')
const { rollRange, weightedChoiceRemoved} = require('../../../../utils/randomDice')
const {getRarityNumber, rarityEvents} = require('../../itemUtils')
const {getCraftingMaterials} = require('../../../../data/resourceDetails/craftingMaterials')

/**
 * 
 * @param {Number} tier 
 * @param {String} rarity 
 * @returns {Number}
 */
function getBaseSpeed(tier, rarity) {
  const toolSpeed = [
// com, unc, rar, epi, leg, max
  [  0,   5,  10,  20,  30,  50], //T1
  [  5,  20,  45,  60,  75, 100], //T2
  [ 20,  45,  70,  95, 120, 150], //T3
  [ 45,  70, 100, 130, 160, 200], //T4
  [ 70, 100, 140, 180, 220, 300], //T5
];
  // Access the values from the two-dimensional array
  const min = toolSpeed[tier - 1][getRarityNumber(rarity)]
  const max = toolSpeed[tier - 1][getRarityNumber(rarity) + 1]
  
  // Roll a random number within the specified range
  return rollRange(min, max) / 100;
}


/**
 * 
 * @param {GatheringTool} tool 
 * @param {[String]} selectedResources 
 */
function applyBonus(tool, selectedResources){
  const gatheringBonuses = ['speed', 'luck', 'yield', 'exp']
  const skillToStats = {
    "woodcutting": "con",
    "mining": "str",
    "harvesting": "int"
  }

  const stats = []
  for (const skill of tool.skills) {
    stats.push(skillToStats[skill])
  }

  const bonuses = [...gatheringBonuses, stats] 

  const statBonus = [1,2,3,4,5]
  const toolBonus = {
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
  const rarity = tool.rarity
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
  rolledBonus = rolledBonus.concat(weightedChoiceRemoved(filterdBonuses, getRarityNumber(rarity) - rolledBonus.length))
  console.log( "rolledBonus" , rolledBonus)
  
  rolledBonus.forEach(bonus => {
    switch (bonus) {
      case 'speed':
        tool.properties.speedBonus = toolBonus.speed[getRarityNumber(rarity)];
      break;
        
      case 'luck':
        tool.properties.luckBonus = toolBonus.luck[getRarityNumber(rarity)];
        break;
        
      case 'yield':
        tool.properties.yieldMax = toolBonus.yield[getRarityNumber(rarity)];
        break;
          
      case 'exp':
        tool.properties.expBonus = toolBonus.exp[getRarityNumber(rarity)];
        break;

      case 'con':
        tool.properties.con = toolBonus.stat[getRarityNumber(rarity)];
        break;
      case 'str':
        tool.properties.str = toolBonus.stat[getRarityNumber(rarity)];
        break;
      case 'int':
        tool.properties.int = toolBonus.stat[getRarityNumber(rarity)];
        break;
      case 'dex':
        tool.properties.dex = toolBonus.stat[getRarityNumber(rarity)];
        break;
      case 'foc':
        tool.properties.foc = toolBonus.stat[getRarityNumber(rarity)];
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
async function upgradeGatheringTool(recipeName, recipe, selectedUpgrades, characterSkill){
  const name = recipe["name"]
  const skills = recipe["skills"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

  // find the item to upgrades and get the rarity
  const rarity = selectedUpgrades.find(str => str.includes(recipeName))?.split("_")[1]
  
  // get base speed
  const baseSpeed = getBaseSpeed(tier, rarity)
  
  // craft item

  const tool = new GatheringTool(name, skills, level, tier, rarity, baseSpeed)
  applyBonus(tool, selectedUpgrades)

  console.log(tool)

  const toolDB = await tool.save()

  return toolDB._id
}

module.exports = {upgradeGatheringTool}