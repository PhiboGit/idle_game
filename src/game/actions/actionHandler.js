const ActionManager = require('./actionManager')
const {verifyAction} = require('./actionVerifier')
const {senderMediator} = require('../../routes/websocket/mediator')

function handleCancel(character, msg) {
  console.log('msg:', msg);
  const isMsgValid = msg && typeof msg === 'object';
  console.log(`Check isMsgValid - ${isMsgValid}`);

  const isTypeValid = msg.type && typeof msg.type === 'string' && msg.type === 'cancel';
  console.log(`Check isTypeValid - ${isTypeValid}`);

  const isIndexNumber = typeof msg.index === 'number';
  console.log(`Check isIndexNumber - ${isIndexNumber}`);

  const isIndexInteger = Number.isInteger(msg.index);
  console.log(`Check isIndexInteger - ${isIndexInteger}`);

  const isIndexValidRange = msg.index >= -1 && msg.index <= 4;
  console.log(`Check isIndexValidRange - ${isIndexValidRange}`);

  if (!(isMsgValid && isTypeValid && isIndexNumber && isIndexInteger && isIndexValidRange)) {
    senderMediator.publish('error', {
      character: character,
      msg: {
        message: "The submitted form for type: 'cancel' is not valid!",
        info: {
          index: 'Number/Integer: -1 to 4, -1 is the current running action, else the index of the Queue.',
        }
      }
    });
    return;
  }

  ActionManager.cancelAction(character, msg.index);
}


function handleAction(character, msg) {
  const valid = verifyAction(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
       msg: {message: "The submitted form for type: 'action' is not valid!",
             info: {
              not_implemented: "Server: Info is not implemented with a return value"
            }}})
    return
  }

  ActionManager.add(character, msg)
}

module.exports = {handleCancel, handleAction}