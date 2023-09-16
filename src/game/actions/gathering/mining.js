const {choice, rollDice} = require('../../utils/randomDice')
const {getMiningData} = require('../../data/gatheringResourceTable')
const Globals = require('../../utils/globals')
const CharacterService = require('../../models/services/characterService')

const {senderMediator} = require('../../../routes/websocket/mediator')

async function startMining(character, args, activeTimeout) {
	return new Promise(async (resolve, reject) => {
		console.log('init mining...')
		const tier = args.tier
		const miningData = getMiningData(tier)
		const requiredLevel = miningData.level
		characterSkill = await CharacterService.getSkill(character, 'mining')

		//check is required level to use
		characterSkillLevel = characterSkill.level
		if (characterSkillLevel < requiredLevel) {
			// The action does not get executed!
			console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
			reject('level')
			return
		}

	console.log('init mining timeout...')
	let actionTime = miningData.time
	const timeoutID = setTimeout(async () => {
		// after the delay we loot!
		await calculatingGains(character, tier)
		activeTimeout[character] = null
		resolve('success!')
	}, Globals.getSpeedModifier()*actionTime)

	// setting a function to cancel the timeout
	function cancelTimeout() {
		console.log('cancelling timeout mining...')
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
	const OreTierData = getMiningData(tier)

	// rolling the loot and calculating exp gains
	const OreAmount = rollDice(OreTierData.amount)
	console.log(`${character} gathered ${OreAmount} tier${tier} Ore `)
	const characterExp = OreTierData.CharacterExp

	// filling out the form to increment the values of a character
	const incrementData = {}

	incrementData['exp'] = characterExp
	incrementData['skills.mining.exp'] = OreTierData.exp
	incrementData[`resources.oreT${tier}`] = OreAmount
	
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData)
}

module.exports = {startMining}