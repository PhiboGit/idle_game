const ActionManager = require('./actionManager')
const {choice, rollDice} = require('../utils/randomDice')
const {getWoodcuttingData} = require('../data/gatheringResourceTable')
const Globals = require('../utils/globals')
const CharacterService = require('../models/services/characterService')
const {WsGatheringForm} = require('../../routes/websocket/wsForms/wsGatheringForm')
const {SkillForm} = require('../models/skills')
const {getCharacterForm_Increment} = require('../models/characterForm')

const {senderMediator} = require('../../routes/websocket/mediator')


/**
 * Initializes the woodcutting for the character.
 *  
 * @param {String} character 
 * @param {WsGatheringForm} form 
 * @returns 
 */
async function woodcutting(character, form) {
    const tier = form.tier
    const requiredLevel = getWoodcuttingData(tier).level

    //check is required level to use
    characterSkill = await CharacterService.getSkill(character, 'woodcutting')
    console.log("getSkill: " ,characterSkill)
    
    characterSkillLevel = characterSkill.level
    if (characterSkillLevel < requiredLevel) {
        // The action does not get executed!
        console.log(`${character} does not have the required level. Is ${characterSkillLevel} but needs ${requiredLevel}`)
        senderMediator.publish('info', {character: character, msg: {rejected: "You do not have the required level"}})
        return
    }


    console.log(`${character} started woodcutting tier: ${tier}`)
    // starting the action
    woodcuttingAction(character, tier, form.limit, form.iterations)
}


/**
 * Sets the action for the character to woodcutting.
 * 
 * @param {String} character 
 * @param {Number} tier 
 * @param {Boolean} limit 
 * @param {Number} iterations if limit is true then the action is executed number of iterations.
 * @returns 
 */
async function woodcuttingAction(character, tier, limit, iterations) {
    // cancel the action if limited
    if (limit && iterations <= 0){
        return
    }

    characterSkill = await CharacterService.getSkill(character, 'woodcutting')
    // calculate the required time
    let cuttingTime = getWoodcuttingData(tier).time

    // start a Timeout to prefrom the action with a delay
    action = setTimeout(async() => {
        // after the delay we loot!
        calculatingGains(character, tier)

        // repeatedly performs the action and decrements the iteration counter
        woodcuttingAction(character, tier, limit, --iterations)
    }, Globals.getSpeedModifier()*cuttingTime)

    // set the action. This way the character has an active action.
    ActionManager.setAction(character, action)
    console.log(`${character} woodcutting iteration: ${iterations}`)
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
    console.log(`${character} gathered ${woodAmount} tier${tier} Wood `)
    const characterExp = woodTierData.CharacterExp

    // filling out the form to increment the values of a character
    const form = getCharacterForm_Increment()
    form.exp = characterExp
    form.resource.wood.tiers[tier] = woodAmount
    form.skills.woodcutting.exp = woodTierData.exp
    
    // At last update all the values for the character.
    await CharacterService.increment(character, form)
}

module.exports = {woodcutting}