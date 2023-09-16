const { Globals, getGatheringData, looting, validateLevel } = require('../actionUtils');

async function initGathering(skillName, character, args, activeTimeout, resolve, reject) {
  console.log(`init ${skillName}...`);
  const tier = args.tier;
  const gatheringData = getGatheringData(skillName, tier);

  try {
    await validateLevel(character, skillName, gatheringData.level);
    console.log('validateLevel successfully');
  } catch (error) {
    console.log('Validation failed: ', error.message);
    reject(error.message);
    return;
  }

  console.log(`Validation complete. Init timeout ${skillName}...`);
  let actionTime = gatheringData.time;

  const timeoutID = setTimeout(async () => {
    // after the delay we loot!
    try {
      await looting(character, skillName, tier);
    } catch (error) {
      console.log('crafting failed: ', error.message);
      reject(error.message);
      return;
    }
    activeTimeout[character] = null;
    resolve('success!');
  }, Globals.getSpeedModifier() * actionTime);

  console.log(`Init timeout complete. Waiting for loot ${skillName}...`);
  // setting a function to cancel the timeout
  function cancelTimeout() {
    console.log(`cancelling timeout ${skillName}...`);
    clearTimeout(timeoutID);
    reject('cancel');
  }
  activeTimeout[character] = cancelTimeout;
}

module.exports = { initGathering };
