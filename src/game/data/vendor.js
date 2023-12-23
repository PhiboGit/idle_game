const {vendorData} = require('../utils/dataLoader')
const {getRarityNumber} = require('../models/items/itemUtils')

function getSellValueGold(tier, rarity){
  return vendorData.sell.rarityTierMatrix[getRarityNumber(rarity)][tier]
}

module.exports = {getSellValueGold}