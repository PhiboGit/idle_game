const rarityEvents = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const rarityToNumber = {
  "common": 0,
  "uncommon": 1,
  "rare": 2,
  "epic": 3,
  "legendary": 4
}

/**
 * 
 * @param {String} rarity 
 * @returns {Number}
 */
function getRarityNumber(rarity) {
  return rarityToNumber[rarity]
}

module.exports = {getRarityNumber, rarityEvents}