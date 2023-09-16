const {initGathering} = require('./gatheringAction');

const skillName = 'woodcutting';

async function startWoodcutting(character, args, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    initGathering(skillName, character, args, activeTimeout, resolve, reject);
  });
}

module.exports = { startWoodcutting };