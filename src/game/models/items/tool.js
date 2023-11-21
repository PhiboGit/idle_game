const Item = require('../item')
const {weightedChoice, adjustWeights, rollDice, rollRange, weightedChoiceRemoved} = require('../../utils/randomDice')
const {getRecipe} = require('../../data/recipesData')
const {getCraftingMaterials} = require('../../data/items/craftingMaterials')


class Tool extends Item {
  constructor(subtype, level, tier, rarity, baseSpeed=0, speedBonus=0, luckBonus=0, yieldBonus=0, expBonus=0) {
    super();
    this.type = 'tool';
    this.subtype = subtype;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      speed: baseSpeed,
      baseSpeed,
      speedBonus,
      luckBonus,
      yieldBonus,
      expBonus
    };
  }
}

const rarityEvents = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const rarityToNumber = {
  "common": 0,
  "uncommon": 1,
  "rare": 2,
  "epic": 3,
  "legendary": 4
}

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
  const min = toolSpeed[tier - 1][rarityToNumber[rarity]]
  const max = toolSpeed[tier - 1][rarityToNumber[rarity] + 1]
  
  // Roll a random number within the specified range
  return rollRange(min, max);
}



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
  rolledBonus = rolledBonus.concat(weightedChoiceRemoved(filterdBonuses, rarityToNumber[rarity] - rolledBonus.length))
  console.log( "rolledBonus" , rolledBonus)
  
  rolledBonus.forEach(bonus => {
    switch (bonus) {
      case 'speed':
        // speedBonus is a multiplier to the base speed, rounded up
        const speedMultiplier = toolBonus.speed[rarityToNumber[rarity]];
        tool.properties.speedBonus = Math.floor(tool.properties.baseSpeed * speedMultiplier) + 1;
        // increment speed
        tool.properties.speed += tool.properties.speedBonus;
        break;
        
      case 'luck':
        tool.properties.luckBonus = toolBonus.luck[rarityToNumber[rarity]];
        break;
        
      case 'yield':
        tool.properties.yieldBonus = toolBonus.yield[rarityToNumber[rarity]];
        break;
          
      case 'exp':
        tool.properties.expBonus = toolBonus.exp[rarityToNumber[rarity]];
        break;
              
      default:
        // Handle any unexpected bonus
        console.error(`Unknown bonus type: ${bonus}`);
      }
    })
  }


  
  function getRarity(skillLevel, selectedResources){
    const rarityWeights = [8000, 1500, 400, 90, 10] // 0 - 10000; 1 = 0.001
    const defaultWindow = [0, 2000]

    // at level 75 the endWindow is 0, unlocks uncommon, rare,... later
    let endWindow = defaultWindow[1] - Math.floor(defaultWindow[1] * (Math.min(75, skillLevel) / 75 ))
    let startWindow = defaultWindow[0] + Math.min(2000, 16 * Math.max(0, skillLevel - 75))
    
    for (const selectedItem of selectedResources) {
      const item = getCraftingMaterials(selectedItem)
      if (!item) continue
      if (item["craftingBonus"]){
      startWindow += item["craftingBonus"]
     }
  }

  console.log("Weights: " + rarityWeights)
  console.log("Window: " + defaultWindow[0] + " " + defaultWindow[1])
  
  // get rarity
  console.log("Window: " + startWindow + " " + endWindow)
  const weights = adjustWeights(rarityWeights, startWindow, endWindow)
  console.log("Weights: " + weights)
  const rarity = weightedChoice(rarityEvents, 1, weights)[0]
  return rarity
}

async function craft(recipeName, recipe, selectedIngredients, characterSkill){
  const type = recipe["type"]
  const subtype = recipe["subtype"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck
  
  
  const rarity = getRarity(skillLevel, selectedIngredients)

  return `${recipeName}_${rarity}`
}

async function upgrade(recipeName, recipe, selectedUpgrades, characterSkill){
  const type = recipe["type"]
  const subtype = recipe["subtype"]
  const tier = recipe["tier"]
  const level = recipe["equipLevel"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck

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

module.exports = {craft, upgrade}