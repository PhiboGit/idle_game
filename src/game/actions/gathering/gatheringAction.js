const { Globals,CharacterService, getGatheringData, looting, validateLevel } = require('./gatheringUtils');

async function validateGathering(skillName, character, args, resolve, reject){
  console.log(`init Validation ${skillName}...`)
  const tier = args.tier;
  const gatheringData = getGatheringData(skillName, tier);

  const characterSkill = await CharacterService.getSkill(character, skillName);

  try {
    await validateLevel(character, characterSkill.level, gatheringData.level);
    console.log('validateLevel successfully');
  } catch (error) {
    console.log('Validation failed: ', error.message);
    reject(error.message);
    return;
  }

  console.log(`Validation complete.`);
  let actionTime = Math.floor(gatheringData.time / (1 + characterSkill.speed));

  if (!actionTime || actionTime < 2000){
    actionTime = 2000;
  }

  resolve(actionTime)
  return 
}


async function initGathering(skillName, character, args, activeTimeout, resolve, reject, actionTime) {
  console.log(`init timeout ${skillName}...`);
  const tier = args.tier;
  
  if (!actionTime || actionTime < 2000){
    actionTime = 2000;
  }

  const timeoutID = setTimeout(async () => {
    // after the delay we loot!
    try {
      await looting(character, skillName, tier);
    } catch (error) {
      console.log('gathering failed: ', error.message);
      reject(error.message);
      return;
    }
    activeTimeout[character] = null;
    resolve('success!');
  }, Globals.getSpeedModifier() * actionTime);

  console.log(`Init timeout with ${actionTime}ms complete. Waiting for loot ${skillName}...`);
  // setting a function to cancel the timeout
  function cancelTimeout() {
    console.log(`cancelling timeout ${skillName}...`);
    clearTimeout(timeoutID);
    reject('cancel');
  }
  activeTimeout[character] = cancelTimeout;
}


module.exports = { initGathering, validateGathering};
