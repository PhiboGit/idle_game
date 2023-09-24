const {Item} = require('../item')
const {weightedChoice, adjustWeights, rollDice, rollRange} = require('../../utils/randomDice')
const {getRecipe} = require('../../data/recipesData')


class Pickaxe extends Item {
  constructor(tier, rarity, speed, luck=0, yieldBonus=0, exp=0) {
    super();
    this.itemType = 'pickaxe';
    this.tier = tier
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

const rarityWeights = [240, 135, 50, 20, 5]
const defaultWindow = [0, 250]

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

async function craft(skillName, level, recipeName, selectedResources){
  const recipe = getRecipe(skillName,recipeName)

  let startWindow = defaultWindow[0] + Math.floor(level / 2)
  let endWindow = defaultWindow[1] + level
  const rarity = weightedChoice(rarityEvents, 1, rarityWeights)[0]

  let speed = rollRange(toolSpeed[rarity]["min"], toolSpeed[rarity]["max"]) 

  const pickaxe = new Pickaxe(recipe["tier"], rarity, speed )

  const savedPickaxe = await pickaxe.save()

  return savedPickaxe._id
}

module.exports = {craft}