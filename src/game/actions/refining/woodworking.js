const {Globals, validateLevel, validateIngredients, getRecipe, crafting } = require('../actionUtils')

const skillName = 'woodworking'

async function startWoodworking(character, args, activeTimeout) {
	return new Promise(async (resolve, reject) => {
		console.log(`init Validation ${skillName}...`)

		const recipeName = args.recipe
		const recipe = getRecipe(skillName, recipeName)
    if(!recipe) {
			console.log(`${recipeName} does not exist for ${skillName}`)
      reject('recipe')
      return
    }

		const selectedResources = new Set()
		//check is required level to use and used the recipe ingredients correctly
		try {
      await validateLevel(character, skillName, recipe.level)
			console.log('validateLevel successfully')
			await validateIngredients(character, args.ingredients, recipe, selectedResources)
			console.log('validateIngredients successfully')
    } catch (error) {
			console.log('Validation failed: ', error.message)
      reject(error.message);
      return;
    }
		

	// all the selected items are valid
	console.log(`Validation complete. Init timeout ${skillName}...`)

	let actionTime = recipe.time
	const timeoutID = setTimeout(async () => {
		// after the delay we craft!
		try {
			await crafting(character,skillName, recipeName, selectedResources)
		} catch (error) {
			console.log('crafting failed: ', error.message)
      reject(error.message);
      return;
		}
		activeTimeout[character] = null
		resolve('success!')
	}, Globals.getSpeedModifier()*actionTime)

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log(`cancel timeout ${skillName}...`)
		clearTimeout(timeoutID)
		reject('cancel')
	}
	activeTimeout[character] = cancelTimeout

	});
}

module.exports = {startWoodworking}