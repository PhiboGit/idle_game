const mongoose = require('mongoose')


const skill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},
  speed: {type: Number, default: 0},
  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
  }
}

const gatheringSkill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},
  speed: {type: Number, default: 0},
  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
  }
}

const skills = {
  woodcutting: gatheringSkill,
  mining: gatheringSkill,
  harvesting: gatheringSkill,  

  woodworking:skill,
  weaving: skill,
  smelting:skill,

  toolsmith: skill,

  enchanter: skill,

}

module.exports = {skills};