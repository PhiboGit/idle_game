const Item = require('../../../item')


class GatheringTool extends Item {
  constructor(name, skill, level, tier, rarity, baseSpeed = 0) {
    super();
    this.name = name;
    this.type = 'tool';
    this.subtype = 'gathering';
    this.skill = skill;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      baseSpeed, // Float 0.05 or 2.45 which gives a 5% or 245% speed
      speedBonus: 0, // Float 0-1 applies percentage bonus to baseSpeed, boosts the effectivity of baseSpeed
      luckBonus: 0, // Flat luck value of 0 - 2500
      yieldMax: 0, // Float 0-5, applies to maxRoll
      expBonus: 0 // Float 0-1 applies to exp
    };
  }
}

module.exports = GatheringTool