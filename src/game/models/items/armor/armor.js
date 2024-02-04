const Item = require('../../item')


class Armor extends Item {
  constructor(name, equipmentType, equipmentSkills, level, tier, rarity) {
    super();
    this.name = name;
    this.equipmentType = equipmentType;
    this.equipmentSkills = equipmentSkills;
    this.level = level;
    this.tier = tier;
    this.rarity = rarity;
    this.properties = {
      totalGearScore: 0,
      gearScores: {
        
      }
    };
  }
}

module.exports = Armor