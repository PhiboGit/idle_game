const ActionManager = require('./actionManager')
const {choice, rollDice} = require('../utils/randomDice')
const {getMiningData} = require('../data/gatheringResourceTable')
const Globals = require('../utils/globals')
const CharacterService = require('../models/services/characterService')
const {WsGatheringForm} = require('../../routes/websocket/wsForms/wsGatheringForm')
const {SkillForm} = require('../models/skills')
const {getCharacterForm_Increment} = require('../models/characterForm')

const {senderMediator} = require('../../routes/websocket/mediator')

/**
 * Initializes the mining for the character.
 *  
 * @param {String} character 
 * @param {WsGatheringForm} form 
 * @returns 
 */
async function mining(character, form) {
    const tier = form.tier
    const requiredLevel = getMiningData(tier).level

    //check is required level to use
    characterSkill = await CharacterService.getSkill(character, 'mining')
    console.log("getSkill: " ,characterSkill)
    
    characterSkillLevel = characterSkill.level
    if (characterSkillLevel < requiredLevel) {
        // The action does not get executed!
        console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
        senderMediator.publish('info', {character: character, msg: {rejected: "You do not have the required level"}})
        return
    }


    console.log(`${character} started mining tier: ${tier}`)
    // starting the action
    miningAction(character, tier, form.limit, form.iterations)
}


/**
 * Sets the action for the character to mining.
 * 
 * @param {String} character 
 * @param {Number} tier 
 * @param {Boolean} limit 
 * @param {Number} iterations if limit is true then the action is executed number of iterations.
 * @returns 
 */
async function miningAction(character, tier, limit, iterations) {
    // cancel the action if limited
    if (limit && iterations <= 0){
        return
    }

    characterSkill = await CharacterService.getSkill(character, 'mining')
    // calculate the required time
    let cuttingTime = getMiningData(tier).time

    // start a Timeout to prefrom the action with a delay
    action = setTimeout(async() => {
        // after the delay we loot!
        calculatingGains(character, tier)

        // repeatedly performs the action and decrements the iteration counter
        miningAction(character, tier, limit, --iterations)
    }, Globals.getSpeedModifier()*cuttingTime)

    // set the action. This way the character has an active action.
    ActionManager.setAction(character, action)
    console.log(`${character} mining iteration: ${iterations}`)
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
    const form = getCharacterForm_Increment()
    form.exp = characterExp
    form.resource.ore.tiers[tier] = OreAmount
    form.skills.mining.exp = OreTierData.exp
    
    // At last update all the values for the character.
    await CharacterService.increment(character, form)
}

module.exports = {mining}