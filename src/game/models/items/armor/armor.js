const Item = require('../../item')

class Armor extends Item {
  constructor(subtype, level, tier, rarity, resistance = 0) {
    super();
    this.type = 'tool';
    this.subtype = subtype;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.enchantingLevel = 0;
    this.properties = {
      resistance,
    };
  }
}