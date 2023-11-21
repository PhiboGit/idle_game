const {initCrafting, validateCrafting} = require('./craftingAction');

const skillName = 'toolsmith';

async function validate(character, args) {
  return new Promise(async (resolve, reject) => {
    validateCrafting(skillName, character, args, resolve, reject);
  });
}

async function start(character, args, activeTimeout, actionTime) {
  return new Promise(async (resolve, reject) => {
    initCrafting(skillName, character, args, activeTimeout, resolve, reject, actionTime);
  });
}

module.exports = {validate, start};