const Tool = require('./tool')
const { rollRange, weightedChoiceRemoved} = require('../../../utils/randomDice')
const {getRarityNumber, rarityEvents} = require('../itemUtils')
const {getCraftingMaterials} = require('../../../data/items/craftingMaterials')

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
  return rollRange(min, max);
}


/**
 * 
 * @param {Tool} tool 
 * @param {[String]} selectedResources 
 */
function applyBonus(tool, selectedResources){
  const bonuses = ['speed', 'luck', 'yield', 'exp']

  const toolBonus = {
    "speed":
    //com,  unc,  rar,  epi,  leg
    [0.33, 0.33, 0.33, 0.33, 0.33],
    "luck":
    //com,  unc,  rar,  epi,  leg
    [500, 1000, 1500, 2000, 2500],
    "yield":
    //com, unc, rar, epi, leg
    [  1,   2,   3,   4,  5],
    "exp": 
    //com, unc, rar, epi, leg
    [5,  10,  15,  20,  25]
  }
  const rarity = tool.rarity
  //get bonus
  let rolledBonus = []
  for (const bonusCharm of selectedResources) {
    if (bonusCharm.includes('SpeedCharm')){
      rolledBonus.push('speed')
    } else if (bonusCharm.includes('LuckCharm')){
      rolledBonus.push('luck')
    } else if (bonusCharm.includes('YieldCharm')){
      rolledBonus.push('yield')
    } else if (bonusCharm.includes('ExpCharm')){
      rolledBonus.push('exp')
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
        // speedBonus is a multiplier to the base speed, rounded up
        const speedMultiplier = toolBonus.speed[getRarityNumber(rarity)];
        tool.properties.speedBonus = Math.floor(tool.properties.baseSpeed * speedMultiplier) + 1;
        // increment speed
        tool.properties.speed += tool.properties.speedBonus;
        break;
        
      case 'luck':
        tool.properties.luckBonus = toolBonus.luck[getRarityNumber(rarity)];
        break;
        
      case 'yield':
        tool.properties.yieldBonus = toolBonus.yield[getRarityNumber(rarity)];
        break;
          
      case 'exp':
        tool.properties.expBonus = toolBonus.exp[getRarityNumber(rarity)];
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
async function upgradeTool(recipeName, recipe, selectedUpgrades, characterSkill){
  const type = recipe["type"]
  const subtype = recipe["subtype"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

  // find the item to upgrades and get the rarity
  const rarity = selectedUpgrades.find(str => str.includes(recipeName))?.split("_")[1]
  
  // get base speed
  const baseSpeed = getBaseSpeed(tier, rarity)
  
  // craft item
  const tool = new Tool(subtype, level, tier, rarity, baseSpeed)
  applyBonus(tool, selectedUpgrades)

  console.log(tool)

  const toolDB = await tool.save()

  return toolDB._id
}

module.exports = {upgradeTool}