const ActionManager = require('./actionManager')
const WsGatheringForm = require('../../routes/websocket/wsForms/wsGatheringForm')
const {senderMediator} = require('../../routes/websocket/mediator')


function handleCancel(character, msg) {
  if(!(msg && msg.data && typeof msg.data.index === 'number')){
    senderMediator.publish('error', {character: character,
      msg: {message: "Cancel needs 'data' property",
            info: {
             data: {index: 'Number: -1-5, -1 is the current running action, else the index of the Queue.'}
           }}})
    return
  }

  ActionManager.cancelAction(character, msg.data.index)
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

  ActionManager.add(character, msg.type +"/"+ form.gatheringType, form)
}

module.exports = {handleCancel, handleGathering}