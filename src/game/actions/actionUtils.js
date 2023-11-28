const Globals = require('../utils/globals')


function initAction(resolve, reject, activeTimeout, character, actionTime, actionFunction, params){
  console.log(`init action timeout for ${character}...`);

  const timeoutID = setTimeout(async () => {
    try {
      // The most important part, call the action you want to execute with a delay!
      const success = await actionFunction(...params);
      console.log(`Action has finished: `, success)
      activeTimeout[character] = null;
      resolve('success!');
      if (success){
        console.log(`Action has been called successfully!`);
      }
      else {
        console.log(`Action failed!`);
        reject("amount")
      }
    } catch (error) {
      console.log('action failed: ', error.message);
      reject(error.message);
    }
  }, actionTime);

    console.log(`Init action timeout for ${character} with ${actionTime}ms complete. Waiting for action to complete...`);

    // setting a function to cancel the timeout
    function cancelTimeout() {
      console.log(`cancel action timeout for ${character}!`)
      clearTimeout(timeoutID)
      reject('cancel')
    }
    activeTimeout[character] = cancelTimeout
}

/**
 * 
 * @param {String} character 
 * @param {Number} characterSkillLevel 
 * @param {Number} requiredLevel 
 */
async function validateLevel(character, characterSkillLevel, requiredLevel) {

  if (characterSkillLevel < requiredLevel) {
    console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`);
    throw new Error('level');
  }
}

/**
 * 
 * @param {Number} speed time in ms
 * @param {Number} characterSkillSpeed float like 0.05 or 1.5
 * @returns 
 */
function getActionTime(speed, characterSkillSpeed) {
  let actionTime = Math.floor(speed / (1 + characterSkillSpeed));
  console.log(`Calculated time of ${actionTime}ms.`);
  if (!actionTime || actionTime < 2000){
    actionTime = 2000;
  }
  return Math.floor(Globals.getSpeedModifier() * actionTime)
}

module.exports = {initAction, validateLevel, getActionTime}