const CharacterService = require('../../models/services/characterService')
const {getActionTime, validateLevel, initAction} = require('../actionUtils');
const { getGatheringData } = require('../../data/gatheringResourceTable');
const {parseLootTable} = require('../../data/lootTables')

async function validate(character, actionObject) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const tier = actionObject.args.tier;
    console.log(`init Validation ${skillName}-${task}...`)
    const gatheringData = getGatheringData(skillName, tier);

    const characterSkill = await CharacterService.getSkill(character, skillName);

    try {
      await validateLevel(character, characterSkill.level, gatheringData.level);
      console.log('validate Level successfully');
    } catch (error) {
      console.log('Validation failed: ', error.message);
      reject(error.message);
      return;
    }

    console.log(`Validation gathering complete.`);

    const actionTime = getActionTime(gatheringData.time, characterSkill.speed)

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
	const skill = await CharacterService.getSkill(character, skillName)
	const lootBag = parseLootTable(gatheringData.lootTable,1, skill.luck)

	// rolling the loot
	for (const loot of lootBag){
		console.log(`${character} looted ${loot.amount} ${loot.item}`)
		incrementData[`resources.${loot.item}`] = Math.floor(loot.amount * (1 + skill.yield))
	}
	
	// and calculating exp gains
	incrementData['exp'] = gatheringData.CharacterExp
	incrementData[`skills.${skillName}.exp`] = Math.floor(gatheringData.exp * (1 + skill.exp))
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
  return true
}

module.exports = {validate, start};