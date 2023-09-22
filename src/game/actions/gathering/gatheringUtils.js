const {Globals, CharacterService, rollDice, validateLevel} = require('../actionUtils')
const {getGatheringData} = require('../../data/gatheringResourceTable')
const {parseLootTable} = require('../../data/lootTables')


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
	// filling out the form to increment the values of a character
	const incrementData = {}

	const gatheringData = getGatheringData(skillName, tier)
	const skill = await CharacterService.getSkill(character, skillName)
	const lootBag = parseLootTable(gatheringData.lootTable,1, skill.luck)

	// rolling the loot
	for (const loot of lootBag){
		console.log(`${character} looted ${loot.amount} ${loot.item}`)
		incrementData[`resources.${loot.item}`] = loot.amount
	}
	
	// and calculating exp gains
	incrementData['exp'] = gatheringData.CharacterExp
	incrementData[`skills.${skillName}.exp`] = gatheringData.exp
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {Globals, CharacterService, looting, getGatheringData, validateLevel}