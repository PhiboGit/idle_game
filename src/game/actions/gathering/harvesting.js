const {choice, rollDice} = require('../../utils/randomDice')
const {getHarvestingData} = require('../../data/gatheringResourceTable')
const Globals = require('../../utils/globals')
const CharacterService = require('../../models/services/characterService')

const {senderMediator} = require('../../../routes/websocket/mediator')

async function startHarvesting(character, args, activeTimeout) {
	return new Promise(async (resolve, reject) => {
		console.log('init harvesting...')
		const tier = args.tier
		const harvestingData = getHarvestingData(tier)
		const requiredLevel = harvestingData.level
		characterSkill = await CharacterService.getSkill(character, 'harvesting')

		//check is required level to use
		characterSkillLevel = characterSkill.level
		if (characterSkillLevel < requiredLevel) {
			// The action does not get executed!
			console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
			reject('level')
			return
		}

	console.log('init harvesting timeout...')
	let gatheringTime = harvestingData.time
	const timeoutID = setTimeout(async () => {
		// after the delay we loot!
		await calculatingGains(character, tier)
		activeTimeout[character] = null
		resolve('success!')
	}, Globals.getSpeedModifier()*gatheringTime)

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log('cancelling timeout harvesting...')
		clearTimeout(timeoutID)
		reject('cancel')
	}
	activeTimeout[character] = cancelTimeout
	})
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
async function calculatingGains(character, tier) {
	console.log('calculating loot and gains...')
	const harvestingTierData = getHarvestingData(tier)

	// rolling the loot and calculating exp gains
	const fiberAmount = rollDice(harvestingTierData.amount)
	console.log(`${character} gathered ${fiberAmount} tier${tier} fiber `)
	const characterExp = harvestingTierData.CharacterExp

	// filling out the form to increment the values of a character
	const incrementData = {}

	incrementData['exp'] = characterExp
	incrementData['skills.harvesting.exp'] = harvestingTierData.exp
	incrementData[`resources.fiberT${tier}`] = fiberAmount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {startHarvesting}