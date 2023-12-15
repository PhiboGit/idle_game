const {craftingMaterials} = require('../../utils/dataLoader')


function getCraftingMaterials(itemName){
  return craftingMaterials[itemName];
}

module.exports = {getCraftingMaterials}