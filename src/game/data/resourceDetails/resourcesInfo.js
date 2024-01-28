// marketplace or contract for refinements
const { generateEquipmentObject } = require('./generators');
const {craftingMaterials, charms, gatheredResources, refinedResources} = require('../../utils/dataLoader')


const items = {
  ...generateEquipmentObject("pickaxe", "Pickaxe", "Used for mining.", "tool", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("sickle", "Sickle", "Used for harvesting.", "tool", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("axe", "Axe", "Used for woodcutting.", "tool", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),

  ...generateEquipmentObject("hat", "Hat", "Keeps your head warm.", "hat", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("chestpiece", "Chestplate", "", "chestpiece", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("gloves", "Gloves", "", "gloves", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("pants", "Pants", "", "pants", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  ...generateEquipmentObject("boots", "Boots", "", "boots", [1,2,3,4,5], ["common", "uncommon", "rare", "epic", "legendary"]),
  
}

const resourcesInfo = { ...gatheredResources, ...refinedResources, ...charms, ...craftingMaterials, ...items}

module.exports = {resourcesInfo}