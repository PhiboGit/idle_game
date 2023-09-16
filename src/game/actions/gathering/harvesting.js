const {initGathering} = require('./gatheringAction');

const skillName = 'harvesting';

async function startHarvesting(character, args, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    initGathering(skillName, character, args, activeTimeout, resolve, reject);
  });
}

module.exports = { startHarvesting };