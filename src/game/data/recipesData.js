const {recipesData} = require('../utils/dataLoader')


function getRecipe(skillName, recipeName) {
  const recipe = recipesData[recipeName] 
  if (!recipe) return null
  if (recipe.profession !== skillName) return null
  return recipe
}

module.exports = {getRecipe}