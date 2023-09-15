const mongoose = require('mongoose')


const skill = {
  exp: {type: Number, default: 0},
  level: {type: Number, default: 0},
  luck: {type: Number, default: 0},
  speedBonus: {type: Number, default: 0},
}

const skills = {
  woodcutting: skill,
  mining: skill,
  harvesting: skill,  

  woodworking:skill,
  weaving: skill,
  smelting:skill,

}

module.exports = {skills};