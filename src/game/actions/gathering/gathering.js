const CharacterService = require('../../models/services/characterService')
const {getActionTime, validateLevel, initAction} = require('../actionUtils');
const { getGatheringData } = require('../../data/gatheringResourceTable');
const {parseLootTable} = require('../../data/lootTables')
const {rollRange} = require('../../utils/randomDice');
const { skills } = require('../../models/skills');

async function validate(character, actionObject) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const tier = actionObject.args.tier;
    console.log(`init Validation ${skillName}-${task}...`)
    const gatheringData = getGatheringData(skillName, tier);

    const characterSkillData = await CharacterService.getSkillData(character, skillName);

    try {
      await validateLevel(character, characterSkillData.level, gatheringData.level);
      console.log('validate Level successfully');
    } catch (error) {
      console.log('Validation failed: ', error.message);
      reject(error.message);
      return;
    }

    console.log(`Validation gathering complete.`);

    const actionTime = getActionTime(gatheringData.time, characterSkillData.speed)

    resolve(actionTime)
    return 
    });
}

async function start(character, actionObject, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const tier = actionObject.args.tier
    const actionTime = actionObject.actionTime
    initAction(resolve, reject, activeTimeout, character, actionTime, gathering, [character, skillName, tier])
  });
}


/**
 * Does everything after the action has finished.
 * Calculating loot, exp gains, etc.
 * 
 * Then updates the character.
 * 
 * @param {String} character 
 * @param {Number} tier 
 */
async function gathering(character, skillName, tier) {
	console.log('calculating gathering loot and gains...')
	// filling out the form to increment the values of a character
	const incrementData = {}

	const gatheringData = getGatheringData(skillName, tier)
	const skillData = await CharacterService.getSkillData(character, skillName)
  
  let minAmount = gatheringData.amountMin + skillData.yieldMin
  let maxAmount = gatheringData.amountMax + skillData.yieldMax
  const amount = rollRange(minAmount, maxAmount)

  incrementData[`resources.${gatheringData.resourceName}`] = Math.floor(amount)

	// rolling the rare loot table
	const lootBag = parseLootTable(gatheringData.lootTable,1, skillData.luck)
	for (const loot of lootBag){
		console.log(`${character} looted ${loot.amount} ${loot.item}`)
		incrementData[`resources.${loot.item}`] = loot.amount
	}
	
	// and calculating exp gains
	incrementData['exp'] = gatheringData.CharacterExp
	incrementData[`skills.${skillName}.exp`] = (gatheringData.exp * (1 + skillData.expBonus))
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
  return true
}

module.exports = {validate, start};