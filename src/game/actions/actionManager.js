const CharacterService = require('../models/services/characterService')

const actionLookup = {
	'woodcutting': require('./gathering/woodcutting'),
	'mining': require('./gathering/mining'),
	'harvesting': require('./gathering/harvesting'),

	'woodworking': require('./crafting/woodworking'),
	'smelting': require('./crafting/smelting'),
	'weaving': require('./crafting/weaving'),
	'toolsmith': require('./crafting/toolsmith'),
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

function add(character, actionType, args){
  const actionObject = {actionType:actionType, args: args, counter: 0}
  console.log(`ActionManager.add: ${character} `, JSON.stringify(actionObject))
    
  enqueue(character, actionObject)
}

function enqueue(character, actionObject) {
	if(!actionQueue[character]){
		actionQueue[character] = []
	}
	let actionQ = actionQueue[character]
	
	// action queue size limit
	if (actionQ.length >= 5){
		console.log('Queue is full!', actionQ)
		return
	}
	actionQ.push(actionObject)
	if (isQueueProcessRunning[character]){ 
		CharacterService.updateActionManager(character, {$set: { actionQueue: actionQ }})
	}
	console.log(`Added to queue for ${character}: Queue length `, actionQ.length)
	console.log('current Queue: ',character, actionQ.length)
	// start the Queue
	processQueue(character)
}


async function processQueue(character) {
	if (isQueueProcessRunning[character]) {
		console.log('Queue is already being processed.')
		return
	}
	const repeatsQueue = actionQueue[character] // Queue to store repeats objects
	isQueueProcessRunning[character] = true
	console.log('Queue is being processed...')
	while (repeatsQueue.length > 0) {
		// gets the next object in the queue
		const repeats = repeatsQueue.shift()
		CharacterService.updateActionManager(character, {$set: { actionQueue: repeatsQueue }})      
		try {
			await startSequentialTimeouts(character,repeats)
			CharacterService.updateActionManager(character, {$set: { currentAction: null }})
			console.log('All timeouts completed.',character)
		} catch (error) {
			switch (error) {
				case 'cancel':
					console.error('Timeout canceled.', character, repeats)
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

async function startSequentialTimeouts(character, repeats) {
	console.log('startSequentialTimeouts: ', repeats)

	const callback = actionLookup[repeats.actionType]
	    
  while (repeats.args.iterations > 0 || !repeats.args.limit) {
		const time = await callback.validate(character, repeats.args)
		repeats["time"] = time
		CharacterService.updateActionManager(character, {$set: { currentAction: repeats }})
		console.log(`Iterations left: ${repeats.args.iterations}`)
		const result = await callback.start(character, repeats.args, activeTimeout, time)
		console.log(`Timeout completed. ${result}`)
		repeats.counter++
		console.log(`Iterations completed: ${repeats.counter}`)
		repeats.args.iterations--
	}
    
	console.log('startSequentialTimeouts completed: ', repeats)
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