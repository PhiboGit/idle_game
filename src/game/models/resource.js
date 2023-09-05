const mongoose = require('mongoose')

// marketplace or contract for refinements

const ResourceSchema = new mongoose.Schema({
    wood: {
      tiers:{
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
      }
    },
    ore: {
      tiers:{
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
      }
    },
    hide: {
      tiers:{
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
      }
    },
    fiber: {
      tiers:{
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number,
      }
    },
    
}, { _id: false });

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = ResourceSchema;