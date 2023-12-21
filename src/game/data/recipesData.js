const {recipesData} = require('../utils/dataLoader')
const {refiningRecipes} = require('../utils/dataLoader')


function getRecipe(skillName, recipeName) {
  if (skillName === 'woodworking') return getWoodworkingRecipe(recipeName)
  if (skillName === 'smelting') return getSmeltingRecipe(recipeName)
  if (skillName === 'weaving') return getWeavingRecipe(recipeName)
  if (skillName === 'toolsmith') return getToolsmithRecipe(recipeName)
  if (skillName === 'armorer') return getArmorerRecipe(recipeName)
}

function getWoodworkingRecipe(recipeName){
  const woodworkingRecipes = refiningRecipes["woodworking"]
  return woodworkingRecipes[recipeName]
}

function getSmeltingRecipe(recipeName){
  const smeltingRecipes = refiningRecipes["smelting"]

  return smeltingRecipes[recipeName]
}


function getWeavingRecipe(recipeName){
  const weavingRecipes = refiningRecipes["weaving"]

  return weavingRecipes[recipeName]
}

function getToolsmithRecipe(recipeName){
  const toolsmithRecipes = recipesData["toolsmith"]

  return toolsmithRecipes[recipeName]
}

function getArmorerRecipe(recipeName){
  const armorerRecipes = recipesData["armorer"]

  return armorerRecipes[recipeName]
}

module.exports = {getRecipe}