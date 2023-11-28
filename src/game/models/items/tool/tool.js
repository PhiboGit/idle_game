const Item = require('../../item')


class Tool extends Item {
  constructor(subtype, level, tier, rarity, baseSpeed = 0) {
    super();
    this.type = 'tool';
    this.subtype = subtype;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.enchantingLevel = 0;
    this.properties = {
      speed: 0,
      baseSpeed,
      speedBonus: 0,
      luckBonus: 0,
      yieldMax: 0,
      expBonus: 0
    };
  }
}

module.exports = Tool