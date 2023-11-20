const {Globals,CharacterService, validateLevel, validateIngredients, getRecipe, crafting } = require('./craftingUtils')

async function validateCrafting(skillName, character, args, resolve, reject){
  console.log(`init Validation ${skillName}...`)

    const recipeName = args.recipe
    const recipe = getRecipe(skillName, recipeName)
    if(!recipe) {
      console.log(`${recipeName} does not exist for ${skillName}`)
      reject('recipe')
      return
    }

    const characterSkill = await CharacterService.getSkill(character, skillName);
    //check is required level to use and used the recipe ingredients correctly
    try {
      await validateLevel(character, characterSkill.level, recipe.level)
      console.log('validateLevel successfully')
      if (args.task == "crafting"){
        await validateIngredients(character, args.ingredients, recipe.ingredients)
        console.log('validate Ingredients successfully')
      }
      else if (args.task == "upgrading"){
        await validateIngredients(character, args.upgrades, recipe.upgrades)
        console.log('validate Upgrades successfully')
      }
    } catch (error) {
      console.log('Validation failed: ', error.message)
      reject(error.message);
      return;
    }
    

  // all the selected items are valid
  console.log(`Validation ${skillName} complete.`)

  let actionTime = Math.floor(recipe.time / (1 + characterSkill.speed));

  if (!actionTime || actionTime < 2000){
    actionTime = 2000;
  }
  actionTime = Globals.getSpeedModifier() * actionTime

  resolve(actionTime)
  return
}

async function initCrafting(skillName, character, args, activeTimeout, resolve, reject, actionTime) {
  console.log(`init timeout ${skillName}...`);

	const recipeName = args.recipe

	const timeoutID = setTimeout(async () => {
		// after the delay we craft!
		try {
      // The most important part, the crafting iteself. here are the items created and consumed
      // TODO: parameters
			await crafting(character, skillName, args.task, recipeName, args.ingredients? args.ingredients : args.upgrades)
		} catch (error) {
			console.log('crafting failed: ', error.message)
      reject(error.message);
      return;
		}
		activeTimeout[character] = null
		resolve('success!')
	}, actionTime)

	console.log(`Init timeout with ${actionTime}ms complete. Waiting for crafting ${skillName}...`);

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log(`cancel timeout ${skillName}...`)
		clearTimeout(timeoutID)
		reject('cancel')
	}
	activeTimeout[character] = cancelTimeout


}


module.exports = {initCrafting, validateCrafting}