const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: String, // e.g., tool, armor, weapon
  subtype: String, // e.g., 'axe', 'sickle', 'fishing_rod', 'helm', 'chestplate', 'boots'
  tier: Number,
  rarity: String,
  properties: mongoose.Schema.Types.Mixed, // Store item-specific properties as key-value pairs
},
{ collection: 'items' })

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;