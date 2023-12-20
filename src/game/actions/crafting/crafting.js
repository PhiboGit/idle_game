const CharacterService = require('../../models/services/characterService')
const {getRecipe} = require('../../data/recipesData')
const {verifyRecipe} = require('./craftingUtils')
const {getActionTime, initAction} = require('../actionUtils')
const {craft} = require('../../models/items/itemCraft')
const {upgradeItem} = require('../../models/items/itemUpgrade')

async function validate(character, actionObject) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const recipeName = actionObject.args.recipe
    const selectedResources = actionObject.args.ingredients? actionObject.args.ingredients : actionObject.args.upgrades
    console.log(`init Validation ${skillName}-${task}...`)

    try {
      await verifyRecipe(character,task, skillName, recipeName, selectedResources)
    } catch (error) {
      console.log('Validation failed: ', error.message)
      reject(error.message);
      return;
    }
    console.log(`Validation ${skillName}-${task} complete.`)
    // get the time
    const recipe = getRecipe(skillName, recipeName)
    const characterSkill = await CharacterService.getCraftingSkill(character, skillName);
    const actionTime = getActionTime(recipe.time, characterSkill.speed)

    resolve(actionTime)
    return
  });
}

async function start(character, actionObject, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const actionTime = actionObject.actionTime
    const recipeName = actionObject.args.recipe
    const selectedResources = actionObject.args.ingredients? actionObject.args.ingredients : actionObject.args.upgrades
    initAction(resolve, reject, activeTimeout, character, actionTime, crafting, [character, skillName, task, recipeName, selectedResources])
  });
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
 * @param {Set} selectedIngredients
 * @param {Set} selectedUpgrades 
*/
async function crafting(character, skillName, task, recipeName, selectedResources) {
  console.log('crafting in progress...')

  const recipe = getRecipe(skillName,recipeName)
  const characterSkill = await CharacterService.getCraftingSkill(character, skillName);
	// filling out the form to increment the values of a character
	const incrementData = {}
  const pushData = {}
  incrementData['exp'] = recipe.expChar 
  incrementData[`skills.${skillName}.exp`] = (recipe.exp * ( 1 + characterSkill.expBonus))
  
  // check ingredients
  const characterDB = await CharacterService.findCharacter(character)
  // checks if the selectedResources are valid for the recipe
	// and if the user has the required resource amount
  let resources
  switch (task) {
    case "crafting":
      resources = recipe.ingredients      
      break;
    case "upgrading":
      resources = recipe.upgrades
      default:
        break;
  }
  for (const ingredientSlot of resources) {
		for (const item of ingredientSlot.slot) {
      if(selectedResources.includes(item.resource)){
        // the user has selected an item for this ingredient slot.
				// is a selected resource, now check if character has the item
				const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${item.resource}`) || 0
				
				if(inventoryValue < item.amount){
          // the user does not have the required amount of resources
					console.log(`${character} does not have the required inredients. has ${inventoryValue} ${item.resource} but needs ${item.amount}`)
          return false
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
    
    // if it is a unique item, we need to craft or upgrade it
  } else if (recipe.unique){
    if (task == "crafting"){
      const itemName = craft(recipeName, recipe, selectedResources, characterSkill)
      incrementData[`resources.${itemName}`] = recipe.amount
    }
    else if(task == "upgrading"){
      if (recipe.type) {
          const itemId = await upgradeItem(recipeName, recipe, selectedResources, characterSkill)
          pushData['items'] = itemId
      }else{
        console.error(`Unable to upgrade ${recipeName}!`)
      }  
    }
  }
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData, {}, pushData, {})
	return true
}

module.exports = {validate, start};