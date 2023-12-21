const {validateLevel} = require('../actionUtils')
const CharacterService = require('../../models/services/characterService')
const {getRecipe} = require('../../data/recipesData')

/**
 * 
 * @param {String} character 
 * @param {Set} userSelectedIngredients 
 * @param {Recipe} recipe 
 * @returns 
 */
async function validateIngredients(character, selectedResources, recipeResources) {
  console.log(`Validate selected resources for recipe`, selectedResources);
  const characterDB = await CharacterService.findCharacter(character)
  let selected = new Set(selectedResources)
  const valids = new Set()

  for (const ingredientSlot of recipeResources) {
    let found = false;

    for (const item of ingredientSlot.slot) {
      if (selected.has(item.resource)) {
        console.log('found a matching resource');

        const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${item.resource}`) || 0;

        if (inventoryValue < item.amount) {
          console.log(`${character} does not have the required resources. has ${inventoryValue} ${item.resource} but needs ${item.amount}`);
          throw new Error('amount');
        }

        found = true
        valids.add(item.resource)
        selected.delete(item.resource)
        // can only selected one matching resource per slot
        break
      }
    }

    if (ingredientSlot.required && !found) {
      console.log('NEED TO SELECT A REQUIRED RESOURCE!')
      throw new Error('ingredient');
    }
  }

  //every item from the user is valid
  if (selected.size > 0){
    console.log('SOME SELECTED ITEMS ARE INVALID');
    throw new Error('ingredient');
  }
  console.log('validate resources successfully!')
  return true;
}

async function verifyRecipe(character,task, skillName,recipeName, selectedResources ){
  console.log(`Verify recipe...`);
  const characterSkill = await CharacterService.getSkillData(character, skillName);
  const recipe = getRecipe(skillName, recipeName)
  if(!recipe) {
    console.log(`${recipeName} does not exist for ${skillName}`)
    throw new Error('recipe')
  }

  // validate the selected resources with the recipe
  validateLevel(characterSkill.level, recipe.level)
  console.log(`${character} has the required level!`);
  
  let resources
  switch (task) {
    case "crafting":
      resources = recipe.ingredients
      break;
    case "upgrading":
      resources = recipe.upgrades
      break
    default:
      break;
  }
  await validateIngredients(character, selectedResources, resources)
  console.log(`Validation recipe complete.`)  
}

module.exports = {verifyRecipe}