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



const resources = { ...gatheredMaterials, ...refinedMaterials}

module.exports = {resources}