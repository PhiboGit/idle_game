const {recipesData} = require('../utils/dataLoader')


function getRecipe(skillName, recipeName) {
  if (skillName === 'woodworking') return getWoodworkingRecipe(recipeName)
  if (skillName === 'smelting') return getSmeltingRecipe(recipeName)
  if (skillName === 'weaving') return getWeavingRecipe(recipeName)
  if (skillName === 'toolsmith') return getToolsmithRecipe(recipeName)
}

function getWoodworkingRecipe(recipeName){
  const woodworkingRecipes = recipesData["woodworkingRecipes"]
  return woodworkingRecipes[recipeName]
}

function getSmeltingRecipe(recipeName){
  const smeltingRecipes = recipesData["smeltingRecipes"]

  return smeltingRecipes[recipeName]
}


function getWeavingRecipe(recipeName){
  const weavingRecipes = recipesData["weavingRecipes"]

  return weavingRecipes[recipeName]
}

function getToolsmithRecipe(recipeName){
  const toolsmithRecipes = recipesData["toolsmithRecipes"]

  return toolsmithRecipes[recipeName]
}

module.exports = {getRecipe}