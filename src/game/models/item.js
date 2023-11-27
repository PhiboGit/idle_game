const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {type: String, default: "item"}, // e.g., tool, armor, weapon
  subtype: {type: String, default: "item"}, // e.g., 'axe', 'sickle', 'fishing_rod', 'helm', 'chestplate', 'boots'
  level: {type: Number, default: 0},
  soulbound: {type: Boolean, default: false},
  tier: {type: Number, default: 1},
  rarity: {type: String, default: "common"},
  enchantingLevel: {type: Number, default:0},
  properties: mongoose.Schema.Types.Mixed, // Store item-specific properties as key-value pairs
},
{ collection: 'items' })

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;