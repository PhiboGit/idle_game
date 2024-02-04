const Item = require('../../../item')


class GatheringTool extends Item {
  constructor(name, equipmentSkills, level, tier, rarity) {
    super();
    this.name = name;
    this.equipmentType = 'tool';
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

module.exports = GatheringTool