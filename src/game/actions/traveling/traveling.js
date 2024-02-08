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
    const travelTime = actionObject.args.travelTime
    console.log(`init Validation ${skillName}-${task}...`)

    const actionTime = travelTime || 10000

    resolve(actionTime)
    return 
    });
}

async function start(character, actionObject, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const actionTime = actionObject.actionTime
    initAction(resolve, reject, activeTimeout, character, actionTime, traveling, [character])
  });
}


/**
 * 
 * 
 * 
 * 
 * @param {String} character 
 */
async function traveling(character) {
	console.log('traveling action finished: You have traveled.')
	
  return true
}

module.exports = {validate, start};