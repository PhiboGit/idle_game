const Item = require('../item')
const {weightedChoice, adjustWeights, rollDice, rollRange, weightedChoiceRemoved} = require('../../utils/randomDice')
const {getRecipe} = require('../../data/recipesData')
const {getCraftingMaterials} = require('../../data/items/craftingMaterials')


class Tool extends Item {
  constructor(subtype, tier, rarity, speed, speedBonus=0, luckBonus=0, yieldBonus=0, expBonus=0) {
    super();
    this.type = 'tool';
    this.subtype = subtype;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      speed,
      speedBonus,
      luckBonus,
      yieldBonus,
      expBonus
    };
  }
}

const rarityEvents = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const numberOfBonus = {
  "common": 0,
  "uncommon": 1,
  "rare": 2,
  "epic": 3,
  "legendary": 4
}
const bonuses = ['speed', 'luck', 'yield', 'exp']
const rarityWeights = [8000, 1500, 400, 90, 10] // 0 - 10000; 1 = 0.001
const defaultWindow = [0, 0]


const toolSpeed = {
  "T1":{
    "common": {
    "min": -10,
    "max": 0,
    },
    "uncommon": {
      "min": 0,
      "max": 10,
    },
    "rare": {
      "min": 10,
      "max": 20,
    },
    "epic": {
      "min": 20,
      "max": 30,
    },
    "legendary": {
      "min": 30,
      "max": 50,
    }
  },

  "T2":{
    "common": {
    "min": 0,
    "max": 20,
    },
    "uncommon": {
      "min": 20,
      "max": 45,
    },
    "rare": {
      "min": 45,
      "max": 60,
    },
    "epic": {
      "min": 60,
      "max": 75,
    },
    "legendary": {
      "min": 75,
      "max": 100,
    }
  },

  "T3":{
    "common": {
    "min": 20,
    "max": 45,
    },
    "uncommon": {
      "min": 45,
      "max": 70,
    },
    "rare": {
      "min": 70,
      "max": 95,
    },
    "epic": {
      "min": 95,
      "max": 120,
    },
    "legendary": {
      "min": 120,
      "max": 150,
    }
  },

  "T4":{
    "common": {
    "min": 45,
    "max": 70,
    },
    "uncommon": {
      "min": 70,
      "max": 100,
    },
    "rare": {
      "min": 100,
      "max": 130,
    },
    "epic": {
      "min": 130,
      "max": 160,
    },
    "legendary": {
      "min": 160,
      "max": 200,
    }
  },

  "T5":{
    "common": {
    "min": 70,
    "max": 100,
    },
    "uncommon": {
      "min": 100,
      "max": 140,
    },
    "rare": {
      "min": 140,
      "max": 180,
    },
    "epic": {
      "min": 180,
      "max": 220,
    },
    "legendary": {
      "min": 220,
      "max": 300,
    }
  }
}

const toolBonuses = {
  "speed": {
    "common": {
      "min": 1,
      "max": 10,
    },
    "uncommon": {
      "min": 10,
      "max": 20,
    },
    "rare": {
      "min": 20,
      "max": 35,
    },
    "epic": {
      "min": 35,
      "max": 50,
    },
    "legendary": {
      "min": 50,
      "max": 70,
    }
  },

  "luck": {
    "common": {
      "min": 1,
      "max": 10,
    },
    "uncommon": {
      "min": 11,
      "max": 20,
    },
    "rare": {
      "min": 21,
      "max": 30,
    },
    "epic": {
      "min": 31,
      "max": 40,
    },
    "legendary": {
      "min": 41,
      "max": 50,
    }
  },

  "exp": {
    "common": {
      "min": 1,
      "max": 10,
    },
    "uncommon": {
      "min": 11,
      "max": 20,
    },
    "rare": {
      "min": 21,
      "max": 30,
    },
    "epic": {
      "min": 31,
      "max": 40,
    },
    "legendary": {
      "min": 41,
      "max": 50,
    }
  },

  "yield": {
    "common": {
      "min": 1,
      "max": 10,
    },
    "uncommon": {
      "min": 11,
      "max": 20,
    },
    "rare": {
      "min": 21,
      "max": 30,
    },
    "epic": {
      "min": 31,
      "max": 40,
    },
    "legendary": {
      "min": 41,
      "max": 50,
    }
  },
}

async function craft(recipe, selectedResources, characterSkill){

  
  
  const type = recipe["type"]
  const subtype = recipe["subtype"]
  const tier = recipe["tier"]
  
  const skillLevel = characterSkill.level
  const skillLuck = characterSkill.luck
  
  let startWindow = defaultWindow[0] + (skillLevel * 10)
  let endWindow = defaultWindow[1]

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
  
  // get base speed
  let speed = rollRange(toolSpeed[`T${tier}`][rarity]["min"], toolSpeed[`T${tier}`][rarity]["max"]) 
  
  // craft item
  const tool = new Tool(subtype, tier, rarity, speed)
  
  //get bonuses
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
  console.log( "all Boni" , bonuses)
  console.log( "fixed Boni" , rolledBonus)
  const filterdBonuses = bonuses.filter(bonus => !rolledBonus.includes(bonus))
  console.log( "rollable boni" , filterdBonuses)
  rolledBonus = rolledBonus.concat(weightedChoiceRemoved(filterdBonuses, numberOfBonus[rarity]- rolledBonus.length))
  console.log( "rolledBonus" , rolledBonus)
  rolledBonus.forEach(bonus => {
    const value = rollRange(toolBonuses[bonus][rarity]["min"], toolBonuses[bonus][rarity]["max"]);
    // Now, update the corresponding property in the Tool object
    if (bonus === 'speed') {
      tool.properties.speedBonus = value;
      tool.properties.speed = tool.properties.speedBonus + tool.properties.speed
    } else if (bonus === 'luck') {
      tool.properties.luckBonus = value;
    } else if (bonus === 'yield') {
      tool.properties.yieldBonus = value;
    } else if (bonus === 'exp') {
      tool.properties.expBonus = value;
    }
  })

  console.log(tool)

  const toolDB = await tool.save()

  return toolDB._id
}


const recipeTest = getRecipe('toolsmith', 'pickaxeT1')
const selectedResourcesTest = [
  "plankT1",
  "linenT1",
  "ore_rare",
  "miningSpeedCharm"
]
const characterSkillTest = {
  exp: 0,
  level: 200,
  luck: 0,
  speed: 0,
}
craft(recipeTest, selectedResourcesTest, characterSkillTest)

module.exports = {craft}