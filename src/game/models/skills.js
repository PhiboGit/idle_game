const mongoose = require('mongoose')


const SkillsSchema = new mongoose.Schema({
  woodcutting: {
    exp: Number,
    level: Number,
    luck: Number,
    speedBonus: Number,
  },
  mining: {
    exp: Number,
    level: Number,
    luck: Number,
    speedBonus: Number,
  },
  harvesting: {
    exp: Number,
    level: Number,
    luck: Number,
    speedBonus: Number,
  },  
}, { _id: false });


class SkillForm{
  constructor(skill){
    this.level = skill?.level || 0
    this.luck = skill?.luck || 0
    this.speedBonus = skill?.speedBonus || 0
  }
}

function getSkillForm(skill){
  return new SkillForm(skill)
}

module.exports = {SkillsSchema, SkillForm, getSkillForm};