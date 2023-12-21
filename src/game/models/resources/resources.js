// marketplace or contract for refinements
const { generateItemObject } = require('./generators');

const gatheredMaterials = {
  'woodT1': {type: Number, default: 0},
  'woodT2': {type: Number, default: 0},
  'woodT3': {type: Number, default: 0},
  'woodT4': {type: Number, default: 0},
  'woodT5': {type: Number, default: 0},

  'oreT1': {type: Number, default: 0},
  'oreT2': {type: Number, default: 0},
  'oreT3': {type: Number, default: 0},
  'oreT4': {type: Number, default: 0},
  'oreT5': {type: Number, default: 0},

  'fiberT1': {type: Number, default: 0},
  'fiberT2': {type: Number, default: 0},
  'fiberT3': {type: Number, default: 0},
  'fiberT4': {type: Number, default: 0},
  'fiberT5': {type: Number, default: 0},
}

const refinedMaterials = {
  'plankT1': {type: Number, default: 0},
  'plankT2': {type: Number, default: 0},
  'plankT3': {type: Number, default: 0},
  'plankT4': {type: Number, default: 0},
  'plankT5': {type: Number, default: 0},

  'coal': {type: Number, default: 0},
  'ingotT1': {type: Number, default: 0},
  'ingotT2': {type: Number, default: 0},
  'ingotT3': {type: Number, default: 0},
  'ingotT4': {type: Number, default: 0},
  'ingotT5': {type: Number, default: 0},

  'linenT1': {type: Number, default: 0},
  'linenT2': {type: Number, default: 0},
  'linenT3': {type: Number, default: 0},
  'linenT4': {type: Number, default: 0},
  'linenT5': {type: Number, default: 0},
}

const charms = {
  'speedCharm': {type: Number, default: 0}, 
  'expCharm': {type: Number, default: 0}, 
  'luckCharm': {type: Number, default: 0}, 
  'yieldCharm': {type: Number, default: 0},
}

const statCharms = {
  'strCharm': {type: Number, default: 0},
  'conCharm': {type: Number, default: 0},  
  'intCharm': {type: Number, default: 0},  
  'dexCharm': {type: Number, default: 0},  
  'focCharm': {type: Number, default: 0},  
}


const sap ={
  'sap_uncommon': {type: Number, default: 0}, 
  'sap_rare': {type: Number, default: 0}, 
  'sap_epic': {type: Number, default: 0}, 
  'sap_legendary': {type: Number, default: 0}, 
}

const stick ={
  'stick_uncommon': {type: Number, default: 0}, 
  'stick_rare': {type: Number, default: 0}, 
  'stick_epic': {type: Number, default: 0}, 
  'stick_legendary': {type: Number, default: 0}, 
}
const chunk ={
  'chunk_uncommon': {type: Number, default: 0}, 
  'chunk_rare': {type: Number, default: 0}, 
  'chunk_epic': {type: Number, default: 0}, 
  'chunk_legendary': {type: Number, default: 0}, 
}
const strand ={
  'strand_uncommon': {type: Number, default: 0}, 
  'strand_rare': {type: Number, default: 0}, 
  'strand_epic': {type: Number, default: 0}, 
  'strand_legendary': {type: Number, default: 0}, 
}

const pickaxe = {
  "pickaxeT1_common": {type: Number, default: 0},
  "pickaxeT1_uncommon": {type: Number, default: 0},
  "pickaxeT1_rare": {type: Number, default: 0},
  "pickaxeT1_epic": {type: Number, default: 0},
  "pickaxeT1_legendary": {type: Number, default: 0},

  "pickaxeT2_common": {type: Number, default: 0},
  "pickaxeT2_uncommon": {type: Number, default: 0},
  "pickaxeT2_rare": {type: Number, default: 0},
  "pickaxeT2_epic": {type: Number, default: 0},
  "pickaxeT2_legendary": {type: Number, default: 0},

  "pickaxeT3_common": {type: Number, default: 0},
  "pickaxeT3_uncommon": {type: Number, default: 0},
  "pickaxeT3_rare": {type: Number, default: 0},
  "pickaxeT3_epic": {type: Number, default: 0},
  "pickaxeT3_legendary": {type: Number, default: 0},

  "pickaxeT4_common": {type: Number, default: 0},
  "pickaxeT4_uncommon": {type: Number, default: 0},
  "pickaxeT4_rare": {type: Number, default: 0},
  "pickaxeT4_epic": {type: Number, default: 0},
  "pickaxeT4_legendary": {type: Number, default: 0},

  "pickaxeT5_common": {type: Number, default: 0},
  "pickaxeT5_uncommon": {type: Number, default: 0},
  "pickaxeT5_rare": {type: Number, default: 0},
  "pickaxeT5_epic": {type: Number, default: 0},
  "pickaxeT5_legendary": {type: Number, default: 0},
}

const items = {
  ...generateItemObject("pickaxe", 5),
  ...generateItemObject("sickle", 5),
  ...generateItemObject("axe", 5),


  ...generateItemObject("hat",5),
  ...generateItemObject("chestpiece", 5),
  ...generateItemObject("gloves", 5),
  ...generateItemObject("pants", 5),
  ...generateItemObject("boots", 5)
}

const resources = { ...gatheredMaterials, ...refinedMaterials, ...charms, ...statCharms, ...sap, ...stick, ...chunk, ...strand, ...items}

module.exports = {resources}