const ActionManager = require('./actionManager')
const {verify} = require('./actions')
const {senderMediator} = require('../../routes/websocket/mediator')


function handleCancel(character, msg) {
  if(!(msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'cancel' && 
    msg.index && typeof msg.index === 'number' && Number.isInteger(msg.index)
    )){
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'cancel' is not valid!",
            info: {
             index: 'Number/Integer: -1 to 5, -1 is the current running action, else the index of the Queue.',
           }}})
    return
  }

  ActionManager.cancelAction(character, msg.index)
}

function handleAction(character, msg) {
  const valid = verify(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
       msg: {message: "The submitted form for type: 'action' is not valid!",
             info: {
              not_implemented: "Server: Info is not implemented with a return value"
            }}})
    return
  }

  ActionManager.add(character, msg.actionType, msg.args)
}

module.exports = {handleCancel, handleAction}