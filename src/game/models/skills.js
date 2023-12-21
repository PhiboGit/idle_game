const mongoose = require('mongoose')


const refiningSkill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},


  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    chest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    hands: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    legs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    feet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    }
  }
}

const craftingSkill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},


  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    chest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    hands: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    legs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    feet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    }
  }
}

const gatheringSkill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},

  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    chest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    hands: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    legs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    feet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    }
  }
}

const enchantingSkill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},

  equipment: {
    tool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    chest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    hands: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    legs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    },
    feet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Reference to the Item model
      default: null
    }
  }
}

const skills = {
  woodcutting: gatheringSkill,
  mining: gatheringSkill,
  harvesting: gatheringSkill,  

  woodworking:refiningSkill,
  weaving: refiningSkill,
  smelting:refiningSkill,

  toolsmith: craftingSkill,
  armorer: craftingSkill,

  enchanter: enchantingSkill,

}

module.exports = {skills};