const Item = require('../item')

class Armor extends Item {
  constructor(subtype, tier, rarity, resistance) {
    super();
    this.type = 'armor';
    this.subtype = subtype;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      resistance,
    };
  }
}