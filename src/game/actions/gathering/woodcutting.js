const {choice, rollDice} = require('../../utils/randomDice')
const {getWoodcuttingData} = require('../../data/gatheringResourceTable')
const Globals = require('../../utils/globals')
const CharacterService = require('../../models/services/characterService')

const {senderMediator} = require('../../../routes/websocket/mediator')

async function startWoodcutting(character, args, activeTimeout) {
	return new Promise(async (resolve, reject) => {
		console.log('init woodcutting...')
		const tier = args.tier
		const woodcuttingData = getWoodcuttingData(tier)
		const requiredLevel = woodcuttingData.level
		characterSkill = await CharacterService.getSkill(character, 'woodcutting')

		//check is required level to use
		characterSkillLevel = characterSkill.level
		if (characterSkillLevel < requiredLevel) {
			// The action does not get executed!
			console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
			reject('level')
			return
		}

	console.log('init woodcutting timeout...')
	let gatheringTime = woodcuttingData.time

	
	const timeoutID = setTimeout(async () => {
		// after the delay we loot!
		await calculatingGains(character, tier)
		activeTimeout[character] = null
		resolve('success!')
	}, Globals.getSpeedModifier()*gatheringTime)

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log('cancelling timeout woodcutting...')
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
	const woodTierData = getWoodcuttingData(tier)

	// rolling the loot and calculating exp gains
	const woodAmount = rollDice(woodTierData.amount)
	console.log(`${character} gathered ${woodAmount} woodT${tier}`)
	const characterExp = woodTierData.CharacterExp

	
	// filling out the form to increment the values of a character
	const incrementData = {}

	incrementData['exp'] = characterExp
	incrementData['skills.woodcutting.exp'] = woodTierData.exp
	incrementData[`resources.woodT${tier}`] = woodAmount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {startWoodcutting}