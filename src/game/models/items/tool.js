const {Item} = require('../item')
const {weightedChoice, adjustWeights, rollDice, rollRange} = require('../../utils/randomDice')
const {getRecipe} = require('../../data/recipesData')


class Tool extends Item {
  constructor(subtype, tier, rarity, speed, luck=0, yieldBonus=0, exp=0) {
    super();
    this.type = 'tool';
    this.subtype = subtype;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      speed,
      luck,
      yieldBonus,
      exp
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
const bonus = ['speed', 'luck', 'yield', 'exp']
const rarityWeights = [260, 150, 65, 20, 5] // 0 - 500
const defaultWindow = [0, 200]

const toolSpeed = {
  "common": {
    "min": -20,
    "max": 10,
  },
  "uncommon": {
    "min": 0,
    "max": 30,
  },
  "rare": {
    "min": 10,
    "max": 50,
  },
  "epic": {
    "min": 30,
    "max": 80,
  },
  "legendary": {
    "min": 50,
    "max": 100,
  }
}

const toolLuck = {
  "common": {
    "min": -20,
    "max": 10,
  },
  "uncommon": {
    "min": 0,
    "max": 30,
  },
  "rare": {
    "min": 10,
    "max": 50,
  },
  "epic": {
    "min": 30,
    "max": 80,
  },
  "legendary": {
    "min": 50,
    "max": 100,
  }
}

async function craft(recipe, selectedResources, characterSkill){

  const type = recipe["type"]
  const subtype = recipe["subtype"]

  const level = characterSkill.level
  const luck = characterSkill.luck

  console.log("Weights: " + rarityWeights)
  console.log("Window: " + defaultWindow[0] + " " + defaultWindow[1])

  let startWindow = defaultWindow[0] + Math.floor(level / 2)
  let endWindow = defaultWindow[1] - level
  console.log("Window: " + startWindow + " " + endWindow)
  const weights = adjustWeights(rarityWeights, startWindow, endWindow)
  console.log("Weights: " + weights)
  const rarity = weightedChoice(rarityEvents, 1, weights)[0]


  let speed = rollRange(toolSpeed[rarity]["min"], toolSpeed[rarity]["max"]) 

  const pickaxe = new Tool(recipe["subtype"], recipe["tier"], rarity, speed)

  console.log(pickaxe)

  //const savedPickaxe = await pickaxe.save()

  //return savedPickaxe._id
}


const recipeTest = getRecipe('toolsmith', 'pickaxeT1')
const selectedResourcesTest = [
  "plankT1",
  "linenT1",
  "ingotT1"
]
const characterSkillTest = {
  exp: 0,
  level: 60,
  luck: 0,
  speed: 0,
}
craft(recipeTest, selectedResourcesTest, characterSkillTest)

module.exports = {craft}