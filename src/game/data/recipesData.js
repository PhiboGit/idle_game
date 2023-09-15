const {recipesData} = require('../utils/dataLoader')


class CraftingRecipe{
  constructor(recipe){
    amount = recipe.amount
    this.level = recipe.level
    this.time  = recipe.time
    this.exp = recipe.exp
    this.characterExp = recipe.characterExp
    this.ingredients = validIngredients(recipe.ingredients)
  }
}

class Ingredient{
  constructor(ingredient){
    this.resourceName = ingredient.resource
    this.amount = ingredient.amount
   }
}

function validIngredients(ingredients){
  let allIngredients = []
  ingredients.forEach(ingredientSlot => {
    selectOneFromList = []
    ingredientSlot.forEach(ingredient => {
      selectOneFromList.push(new Ingredient(ingredient))
    });  
  });
  return allIngredients
}


function getWoodworkingRecipe(recipeName){
  const woodworkingRecipes = recipesData["WoodworkingRecipes"]

  return woodworkingRecipes[recipeName]
}

function getSmeltingRecipe(recipeName){
  const smeltingRecipes = recipesData["SmeltingRecipes"]

  return smeltingRecipes[recipeName]
}


function getWeavingRecipe(recipeName){
  const weavingRecipes = recipesData["WeavingRecipes"]

  return weavingRecipes[recipeName]
}

module.exports = {getWoodworkingRecipe, getSmeltingRecipe, getWeavingRecipe}