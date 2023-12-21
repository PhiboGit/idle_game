const Item = require('../../item')


class Armor extends Item {
  constructor(name, type, skills, level, tier, rarity, resistance, armor) {
    super();
    this.name = name;
    this.type = type;
    this.skills = skills;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      resistance: resistance,
      armor: armor,

      speed: 0, // integer percentage applies percentage bonus to baseSpeed, boosts the effectivity of baseSpeed
      luck: 0, // Flat luck value of 0 - 2500
      yieldMax: 0, // int 0-5, applies to maxRoll
      exp: 0, // int percentage 1-25 applies to exp

      con: 0, // constitution
      str: 0, // strength
      int: 0, // intelligence
      dex: 0, // dexterity
      foc: 0, // focus
    };
  }
}

module.exports = Armor