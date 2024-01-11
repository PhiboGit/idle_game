const Item = require('../../../item')


class GatheringTool extends Item {
  constructor(name, equipmentSkills, level, tier, rarity, baseSpeed = 0) {
    super();
    this.name = name;
    this.equipmentType = 'tool';
    this.equipmentSkills = equipmentSkills;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      baseSpeed, // integer percent which gives a 5% or 245% speed
      
      speed: 0, // integer applies percentage bonus to baseSpeed, boosts the effectivity of baseSpeed
      luck: 0, // Flat luck value of 0 - 2500
      yieldMax: 0, // int 0-5, applies to maxRoll
      exp: 0, // int percent applies to exp

      con: 0, // constitution
      str: 0, // strength
      int: 0, // intelligence
      dex: 0, // dexterity
      foc: 0, // focus
    };
  }
}

module.exports = GatheringTool