const CharacterService = require('../models/services/characterService')
const RegionManager = require('./regionManager')

const actionLookup = {
	'crafting': require('./crafting/crafting'),
	'upgrading': require('./crafting/crafting'),
	'gathering': require('./gathering/gathering'),
	'enchanting': require('./enchanting/enchanting'),
	'traveling': require('./traveling/traveling')
}


const actionQueue = {} // queue of actions of a character
const activeTimeout = {} // currently running Timeouts

const isQueueProcessRunning = {} // is a queue for the character running

async function init(){
	console.log('ActionManager: init starting')
	const characters = await CharacterService.getAll()
	 for (const character of characters){
		if (character.actionQueue){
			// set the Queue
			actionQueue[character.characterName] = character.actionQueue
			console.log('ActionManager init: actionQueue added for: ', character.characterName)
		}
		if (character.currentAction){
			// set the current action as the first in Queue
			actionQueue[character.characterName].unshift(character.currentAction)
			
			console.log('ActionManager init: currentAction added for: ', character.characterName)
		}
		// start the Queue
		processQueue(character.characterName)
	}
	console.log('ActionManager: init finished')
}

init()

function add(character, msg){
  const actionObject = {
		counter: 0,
		type: msg.type,
		actionType: msg.actionType, 
		task: msg.task,
		limit: msg.limit,
		iterations:msg.iterations,
		args: msg.args,
		info: msg.info
	}
  console.log(`ActionManager.add: ${character} `, actionObject)
    
  enqueue(character, actionObject)
}

function enqueue(character, actionObject) {
	if(!actionQueue[character]){
		actionQueue[character] = []
	}
	let characterActionQ = actionQueue[character]
	
	// action queue size limit
	if (characterActionQ.length >= 5){
		console.log('Queue is full!', characterActionQ)
		return
	}
	characterActionQ.push(actionObject)
	if (isQueueProcessRunning[character]){ 
		CharacterService.updateActionManager(character, {$set: { actionQueue: characterActionQ }})
	}
	console.log(`Added to queue for ${character}: Queue length `, characterActionQ.length)
	console.log('current Queue: ',character, characterActionQ.length)
	// start the Queue
	processQueue(character)
}


async function processQueue(character) {
	if (isQueueProcessRunning[character]) {
		// the character has already a running action
		console.log('Queue is already being processed.')
		return
	}
	const characterActionQ = actionQueue[character] // Queue to store repeats objects
	isQueueProcessRunning[character] = true
	console.log('Queue is being processed...')
	while (characterActionQ.length > 0) {
		// gets the next object in the queue
		let actionObject = characterActionQ.shift()
		// REGION. The regionManager inserts the action. the actionObject is never active and only in queue!
		if(actionObject.type === 'region_action' && actionObject.iterations > 0){
			console.log("actionManager: region_action detected...")
			const actionObjectNew = RegionManager.getNextAction(character, actionObject)

			// add again the the quueue at first position. That way the region_action is processed again.
			characterActionQ.unshift(actionObject)

			actionObject = actionObjectNew
		}
		CharacterService.updateActionManager(character, {$set: { actionQueue: characterActionQ }})      
		try {
			await startSequentialTimeouts(character,actionObject)
			await CharacterService.updateActionManager(character, {$set: { currentAction: null }})
			console.log('All timeouts completed.',character)
		} catch (error) {
			switch (error) {
				case 'region':
					console.error('Region gathering exhausted.', character, actionObject)
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break
				case 'cancel':
					console.error('Timeout canceled.', character, actionObject)
					// canceling an action from the regionManager will cancel the region_action
					// this is to prevent to cancel traveling
					if(actionObject.region_action){
						if(actionQueue[character] && actionQueue[character][0] && actionQueue[character][0].type === 'region_action'){
							dequeue(character, 0)
						}
					}
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break
				case 'level':
					console.error('Level requirement not met!')
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break

				case 'recipe':
					console.error('Recipe does not exist')
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break

				case 'ingredient':
					console.error('Ingredients requirement not met!')
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break

				case 'amount':
					console.error('Ingredients amount requirement not met for character!')
					CharacterService.updateActionManager(character, { $set: { currentAction: null } })
					break
				default:
					throw error
			}
		}
	}
	console.log('No items left in the queue!', character)
	isQueueProcessRunning[character] = false
}

async function startSequentialTimeouts(character, actionObject) {
	console.log('startSequentialTimeouts: ', actionObject)

	const actionClass = actionLookup[actionObject.task]
	    
  while (actionObject.iterations > 0 || !actionObject.limit) {
		const time = await actionClass.validate(character, actionObject)
		actionObject["actionTime"] = time
		CharacterService.updateActionManager(character, {$set: { currentAction: actionObject }})
		console.log(`Iterations left: ${actionObject.iterations}`)
		// this starts the actual action.
		const result = await actionClass.start(character, actionObject, activeTimeout)
		console.log(`Timeout completed. ${result}`)
		actionObject.counter++
		console.log(`Iterations completed: ${actionObject.counter}`)
		actionObject.iterations--
	}
    
	console.log('startSequentialTimeouts completed: ', actionObject)
}

function cancelAction(character, index) {
	if (index < 0){
		cancelRunning(character)
		return
	}
	dequeue(character, index)
}

function cancelRunning(character){
	const cancelTimeout = activeTimeout[character]
	if (typeof cancelTimeout !== 'function'){
		console.log('no active timeout to cancel')
		return 
	}
	console.log('cancel timeout')
	cancelTimeout()
}

function dequeue(character, index) {
	if (!actionQueue[character]) {
		console.log(`Queue for ${character} does not exist.`)
		return
	}

	const repeatsQueue = actionQueue[character]

	if (index < 0 || index >= repeatsQueue.length) {
		console.log(`Invalid index ${index} for ${character}'s queue.`)
		return
	}

	const removedItem = repeatsQueue.splice(index, 1)
	CharacterService.updateActionManager(character, {$set: { actionQueue: repeatsQueue }})
	console.log(`Dequeued item for ${character} at index ${index}:`, removedItem[0])
	console.log('current Queue: ',character, repeatsQueue.length)
}



module.exports = { cancelAction, add}