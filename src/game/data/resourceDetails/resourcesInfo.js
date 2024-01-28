// marketplace or contract for refinements
const { generateEquipmentObject } = require('./generators');
const {craftingMaterials, charms, gatheredResources, refinedResources} = require('../../utils/dataLoader')


const items = {
  ...generateEquipmentObject("pickaxe", "Pickaxe", "Used for mining.", "tool", ["mining"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("sickle", "Sickle", "Used for harvesting.", "tool", ["harvesting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("axe", "Axe", "Used for woodcutting.", "tool", ["woodcutting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),

  ...generateEquipmentObject("hat", "Hat", "Keeps your head warm.", "hat", ["mining", "woodcutting", "harvesting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("chestpiece", "Chestplate", "", "chestpiece", ["mining", "woodcutting", "harvesting"] ,[1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("gloves", "Gloves", "", "gloves", ["mining", "woodcutting", "harvesting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("pants", "Pants", "", "pants", ["mining", "woodcutting", "harvesting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("boots", "Boots", "", "boots", ["mining", "woodcutting", "harvesting"], [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  
}

const resourcesInfo = { ...gatheredResources, ...refinedResources, ...charms, ...craftingMaterials, ...items}

module.exports = {resourcesInfo}