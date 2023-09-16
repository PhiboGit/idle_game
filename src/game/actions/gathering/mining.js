const {initGathering} = require('./gatheringAction');

const skillName = 'mining';

async function startMining(character, args, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    initGathering(skillName, character, args, activeTimeout, resolve, reject);
  });
}

module.exports = { startMining };