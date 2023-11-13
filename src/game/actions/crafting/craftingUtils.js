const {Globals, CharacterService, rollDice, validateLevel} = require('../actionUtils')

const {getRecipe} = require('../../data/recipesData')
const {craft} = require('../../models/items/tool')

const resourcesSkills = ['woodworking', 'smelting', 'weaving']
const uniqueItemSkills = ['toolsmith', 'weaponsmith', 'engineer']

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
    console.log('SOME SELECTED ITEMS ARE INVALID');
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
  const characterSkill = await CharacterService.getSkill(character, skillName);
	// filling out the form to increment the values of a character
	const incrementData = {}
  const pushData = {}
  incrementData['exp'] = recipe.characterExp 
  incrementData[`skills.${skillName}.exp`] = Math.floor(recipe.exp * ( 1 + characterSkill.exp))
  
  // check ingredients
  const characterDB = await CharacterService.findCharacter(character)
  // checks if the userSelectedResources are valid for the recipe
	// and if the user has the required resource amount
  const ingredients_upgrades = [...recipe.ingredients, ...recipe.upgrades]
	for (const ingredientSlot of ingredients_upgrades) {
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
  // every used item is now getting removed
  
  //now add the crafted item
  // if the item is stackable
  if(!recipe.unique){
    // just increment the crafted resource item
	  incrementData[`resources.${recipeName}`] = recipe.amount

  // if it is a unique item, we need to craft it
  } else if (recipe.unique){
    const characterSkill = await CharacterService.getSkill(character, skillName)
    const item_id = await craft(recipe, selectedResources, characterSkill)
    pushData['items'] = item_id
  }
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData, {}, pushData)
	return true
}

module.exports = {Globals, CharacterService, validateIngredients, validateLevel, getRecipe, crafting}