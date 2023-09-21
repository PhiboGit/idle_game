const {Globals, CharacterService, rollDice, validateLevel} = require('../actionUtils')
const {getGatheringData} = require('../../data/gatheringResourceTable')



/**
 * Does everything after the action has finished.
 * Calculating loot, exp gains, etc.
 * 
 * Then updates the character.
 * 
 * @param {String} character 
 * @param {Number} tier 
 */
async function looting(character, skillName, tier) {
	console.log('calculating loot and gains...')
	const gatheringData = getGatheringData(skillName, tier)

	// rolling the loot and calculating exp gains
	const amount = rollDice(gatheringData.amount)
	console.log(`${character} gathered ${amount} ${gatheringData.resourceName}`)
	const characterExp = gatheringData.CharacterExp

	
	// filling out the form to increment the values of a character
	const incrementData = {}

	incrementData['exp'] = characterExp
	incrementData[`skills.${skillName}.exp`] = gatheringData.exp
	incrementData[`resources.${gatheringData.resourceName}`] = amount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {Globals, CharacterService, looting, getGatheringData, validateLevel}