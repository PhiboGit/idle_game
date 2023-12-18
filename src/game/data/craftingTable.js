const dataLoader = require('../utils/dataLoader')
const craftingTable = dataLoader.craftingTable

const {weightedChoice, adjustWeights} = require('../utils/randomDice')


function getRarityEquipment(skillLevel, itemLevel, startBonus, endBonus){
  const table = craftingTable.equipments

  const rarityEvents = table.rarityEvents
  const rarityWeights = table.rarityWeights
  const defaultWindow = table.defaultWindow

  
  let startWindow = defaultWindow[0] + (skillLevel * table.professionLevel.start) + (itemLevel * table.itemLevel.start) + startBonus
  let endWindow = defaultWindow[1] + (skillLevel * table.professionLevel.end) + (itemLevel * table.itemLevel.end) + endBonus
  
  console.log("Weights: " + rarityWeights)
  console.log("default Window: " + defaultWindow[0] + " " + defaultWindow[1])
  console.log("Window: " + startWindow + " " + endWindow)

  const weights = adjustWeights(rarityWeights, startWindow, endWindow)
  console.log("Weights adjusted: " + weights)
  const rarity = weightedChoice(rarityEvents, 1, weights)[0]
  return rarity
}

module.exports = {getRarityEquipment}