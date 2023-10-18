const Item = require('../item')

class Weapon extends Item {
  constructor(subtype, tier, rarity, speed, damage) {
    super();
    this.type = 'weapon';
    this.subtype = subtype;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      speed,
      damage
    };
  }
}