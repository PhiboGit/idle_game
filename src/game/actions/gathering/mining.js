const {initGathering, validateGathering} = require('./gatheringAction');

const skillName = 'mining';

async function validate(character, args, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    validateGathering(skillName, character, args, activeTimeout, resolve, reject);
  });
}

async function start(character, args, activeTimeout, actionTime) {
  return new Promise(async (resolve, reject) => {
    initGathering(skillName, character, args, activeTimeout, resolve, reject, actionTime);
  });
}

module.exports = {validate, start};