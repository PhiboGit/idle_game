const {Globals, CharacterService, rollDice, validateLevel} = require('../actionUtils')

const {getRecipe} = require('../../data/recipesData')


/**
 * 
 * @param {String} character 
 * @param {Set} userSelectedResources 
 * @param {Recipe} recipe 
 * @returns 
 */
async function validateIngredients(character, userSelectedResources, recipe) {
  const characterDB = await CharacterService.findCharacter(character)

  const selected = new Set(userSelectedResources)
  const valids = new Set()

  const ingredients_upgrades = [...recipe.ingredients, ...recipe.upgrades]
  for (const ingredientSlot of ingredients_upgrades) {
    let found = false;

    for (const item of ingredientSlot.slot) {
      if (selected.has(item.resource)) {
        console.log('found a matching resource');

        const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${item.resource}`) || 0;

        if (inventoryValue < item.amount) {
          console.log(`${character} does not have the required ingredients. has ${inventoryValue} ${item.resource} but needs ${item.amount}`);
          throw new Error('amount');
        }

        found = true
        valids.add(item.resource)
        selected.delete(item.resource)
        break
      }
    }

    if (ingredientSlot.required && !found) {
      console.log('NEED TO SELECT A REQUIRED INGREDIENT')
      throw new Error('ingredient');
    }
  }

  //every item from the user is valid
  if (selected.size > 0){
    throw new Error('ingredient');
  }

  return true;
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
			if(selectedResources.includes(item.resource)){
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

module.exports = {Globals, CharacterService, validateIngredients, validateLevel, getRecipe, crafting}