const Globals = require('../utils/globals')
const CharacterService = require('../models/services/characterService')
const {choice, rollDice} = require('../utils/randomDice')
const {getRecipe} = require('../data/recipesData')

const {getGatheringData} = require('../data/gatheringResourceTable')

/**
 * 
 * @param {String} character 
 * @param {Number} characterSkillLevel 
 * @param {Number} requiredLevel 
 */
async function validateLevel(character, characterSkillLevel, requiredLevel) {

  if (characterSkillLevel < requiredLevel) {
    console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`);
    throw new Error('level');
  }
}

/**
 * 
 * @param {String} character 
 * @param {Set} userSelectedResources 
 * @param {Recipe} recipe 
 * @returns 
 */
async function validateIngredients(character, userSelectedResources, recipe, selectedResources) {
  const characterDB = await CharacterService.findCharacter(character)

  for (const ingredientSlot of recipe.ingredients) {
    let found = false;

    for (const item of ingredientSlot.slot) {
      if (userSelectedResources.includes(item.resource)) {
        console.log('found a matching resource');

        if (found) {
          console.log('SELECT maximum 1 INGREDIENT per SLOT')
          throw new Error('ingredient');
        }

        const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${item.resource}`) || 0;

        if (inventoryValue < item.amount) {
          console.log(`${character} does not have the required ingredients. has ${inventoryValue} ${item.resource} but needs ${item.amount}`);
          throw new Error('amount');
        }

        selectedResources.add(item.resource)
        found = true
      }
    }

    if (ingredientSlot.required && !found) {
      console.log('NEED TO SELECT A REQUIRED INGREDIENT')
      throw new Error('ingredient');
    }
  }

  return selectedResources;
}

/**
 * Does everything after the action has finished.
 * Calculating loot, exp gains, etc.
 * 
 * Then updates the character.
 * 
 * @param {String} character 
 * @param {String} skillName 
 * @param {String} recipeName
 * @param {Set} selectedResources 
 */
async function crafting(character, skillName, recipeName, selectedResources) {
  console.log('crafting in progress...')
  const recipe = getRecipe(skillName,recipeName)

	// filling out the form to increment the values of a character
	const incrementData = {}

  // check ingredients
  const characterDB = await CharacterService.findCharacter(character)
  // checks if the userSelectedResources are valid for the recipe
	// and if the user has the required resource amount
	for (const ingredientSlot of recipe.ingredients) {
		for (const item of ingredientSlot.slot) {
			if(selectedResources.has(item.resource)){
				// the user has selected an item for this ingredient slot.
				// is a selected resource, now check if character has the item
				const inventoryValue = CharacterService.getFieldValue(characterDB, 'resources.' + item.resource) || 0
				
				if(inventoryValue < item.amount){
					// the user does not have the required amount of resources
					console.log(`${character} does not have the required inredients. has ${inventoryValue} ${item.resource} but needs ${item.amount}`)
					throw new Error('amount');
				}
				incrementData[`resources.${item.resource}`] = -item.amount
			}
		}
	}
  
	incrementData['exp'] = recipe.characterExp
	incrementData[`skills.${skillName}.exp`] = recipe.exp
	incrementData[`resources.${recipeName}`] = recipe.amount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
	return true
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
async function looting(character, skillName, tier) {
	console.log('calculating loot and gains...')
	const gatheringData = getGatheringData(skillName, tier)

	// rolling the loot and calculating exp gains
	const amount = rollDice(gatheringData.amount)
	console.log(`${character} gathered ${amount} ${gatheringData.resourceName}`)
	const characterExp = gatheringData.CharacterExp

	
	// filling out the form to increment the values of a character
	const incrementData = {}

	incrementData['exp'] = characterExp
	incrementData[`skills.${skillName}.exp`] = gatheringData.exp
	incrementData[`resources.${gatheringData.resourceName}`] = amount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {Globals, CharacterService, looting, rollDice, choice, validateIngredients, validateLevel, getRecipe, getGatheringData, crafting}