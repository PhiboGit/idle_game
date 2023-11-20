// marketplace or contract for refinements


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
  'woodcuttingSpeedCharm': {type: Number, default: 0}, 
  'woodcuttingExpCharm': {type: Number, default: 0}, 
  'woodcuttingLuckCharm': {type: Number, default: 0}, 
  'woodcuttingYieldCharm': {type: Number, default: 0},

  'miningSpeedCharm': {type: Number, default: 0}, 
  'miningExpCharm': {type: Number, default: 0}, 
  'miningLuckCharm': {type: Number, default: 0}, 
  'miningYieldCharm': {type: Number, default: 0},

  'harvestingSpeedCharm': {type: Number, default: 0}, 
  'harvestingExpCharm': {type: Number, default: 0}, 
  'harvestingLuckCharm': {type: Number, default: 0}, 
  'harvestingYieldCharm': {type: Number, default: 0}, 
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

const items = {...pickaxe}

const resources = { ...gatheredMaterials, ...refinedMaterials, ...charms, ...statCharms, ...sap, ...stick,...items}

module.exports = {resources}