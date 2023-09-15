const {choice, rollDice} = require('../../utils/randomDice')

const Globals = require('../../utils/globals')
const CharacterService = require('../../models/services/characterService')

const {getCharacterForm_Increment} = require('../../models/characterForm')

const {senderMediator} = require('../../../routes/websocket/mediator')

async function startWoodworking(character, args, activeTimeout) {
	return new Promise(async (resolve, reject) => {
		console.log('init woodworking...')
		const tier = args.tier
		const recipe = getWoodworkingRecipe(tier)
		const requiredLevel = recipe.level
		characterSkill = await CharacterService.getSkill(character, 'woodworking')

		//check is required level to use
		characterSkillLevel = characterSkill.level
		if (characterSkillLevel < requiredLevel) {
			// The action does not get executed!
			console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
			reject('level')
			return
		}

    // check ingredients
    const characterDB = await CharacterService.findCharacter(character)
    for(const ingredient in recipe.ingredients){
      const resourceValue = CharacterService.getFieldValue(characterDB, 'resource.' + ingredient.resource) || 0

      if(resourceValue < ingredient.amount){
        // The action does not get executed!
			console.log(`${character} does not have the required inredients. has ${resourceValue} ${ingredient.resource} but needs ${ingredient.amount}`)
			reject('ingredient')
			return
      }
    }



	console.log('init woodworking timeout...')
	let refiningTime = recipe.time
	const timeoutID = setTimeout(async () => {
		// after the delay we loot!
		await calculatingGains(character, tier)
		activeTimeout[character] = null
		resolve('success!')
	}, Globals.getSpeedModifier()*refiningTime)

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log('cancelling timeout woodworking...')
		clearTimeout(timeoutID)
		reject('cancel')
	}
	activeTimeout[character] = cancelTimeout
	})
}


/**
 * Does everything after the action has finished.
 * Calculating loot, exp gains, etc.
 * 
 * Then updates the character.
 * 
 * @param {String} character 
 * @param {Number} tier 
 */
async function calculatingGains(character, tier) {
  console.log('calculating loot and gains...')
  const recipe = getWoodworkingRecipe(tier)

  // check ingredients
  const characterDB = await CharacterService.findCharacter(character)
  for(const ingredient in recipe.ingredients){
    const resourceValue = CharacterService.getFieldValue(characterDB, 'resource.' + ingredient.resource) || 0

    if(resourceValue < ingredient.amount){
      // The action does not get executed!
    console.log(`${character} does not have the required inredients. has ${resourceValue} ${ingredient.resource} but needs ${ingredient.amount}`)
    return false
    }
  }
  
  // filling out the form to increment the values of a character
  const form = getCharacterForm_Increment()
  form.exp = recipe.characterExp
  form.resource.wood.tiers[tier] = woodAmount
  form.skills.woodcutting.exp = woodTierData.exp
  
  // At last update all the values for the character.
  await CharacterService.increment(character, form)
}

const recipes = [
  { level: 0,
    time: 20000,
    exp: 10,
    characterExp: 5,
    ingredients: [
      {resource: "wood.tiers.1",
       amount: 12},
    ]
  },
  { level: 25,
    time: 20000,
    exp: 10,
    characterExp: 5,
    ingredients: [
      {resource: "wood.tiers.2",
       amount: 10},
      {resource: "plank.tiers.1",
       amount: 1}
    ]
  },
  { level: 50,
    time: 20000,
    exp: 10,
    characterExp: 5,
    ingredients: [
      {resource: "wood.tiers.3",
       amount: 8},
      {resource: "plank.tiers.2",
       amount: 1}
    ]
  },
  { level: 75,
    time: 20000,
    exp: 10,
    characterExp: 5,
    ingredients: [
      {resource: "wood.tiers.4",
       amount: 6},
      {resource: "plank.tiers.3",
       amount: 1}
    ]
  },
  { level: 100,
    time: 20000,
    exp: 10,
    characterExp: 5,
    ingredients: [
      {resource: "wood.tiers.5",
       amount: 4},
      {resource: "plank.tiers.4",
       amount: 1}
    ]
  },
]

function getWoodworkingRecipe(tier){
  return recipes[tier]
}

module.exports = {startWoodworking}