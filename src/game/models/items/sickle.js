const Item = require('../item')

// Class for Boots
class Pickaxe extends Item {
  constructor(tier, rarity, speed, luck=0, yield=0, exp=0) {
    super();
    this.itemType = 'pickaxe';
    this.tier = tier
    this.rarity = rarity;
    this.properties = {
      speed,
      luck,
      yield,
      exp
    };
  }
}