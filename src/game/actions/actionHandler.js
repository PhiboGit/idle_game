const ActionManager = require('./actionManager')
const {woodcutting} = require('./woodcutting')
const {mining} = require('./mining')
const WsGatheringForm = require('../../routes/websocket/wsForms/wsGatheringForm')
const {senderMediator} = require('../../routes/websocket/mediator')


function handleCancel(character) {
  if(ActionManager.cancelAction(character)){
    console.log("An action has been cancelled")
    senderMediator.publish('action_manager', {character: character, msg: "action cancelled"})
  } else {
  senderMediator.publish('action_manager', {character: character, msg: "no active action"})
  }
}

function handleGathering(character, msg) {
  const form = WsGatheringForm.getGatheringData(msg)
  if (!form) {
    senderMediator.publish('error', {character: character,
       msg: {message: "Gathering needs 'data' property",
             info: {
              data: WsGatheringForm.gatheringDataForm
            }}})
    return
  }

  const gathering = {
    'woodcutting': woodcutting,
    'mining':mining,
    'harvesting': undefined
  }
  
  handler = gathering[form.gatheringType]
  if (typeof handler !== 'function') {
    console.log("Unknown gathering type: " + form.gatheringType)
    senderMediator.publish('error', {character: character, msg: `Check the values of data. Unknown gatheringType: ${form.gatheringType}`})
    return
  }

  handler(character, form)
    
}

module.exports = {handleCancel, handleGathering}