const {gather} = require('./gatheringRouter')
const ActionManager = require('../../game/actions/actionManager')

const {senderMediator} = require('../../routes/websocket/mediator')


function handleAction(char, parsedMessage){
  const messageType = parsedMessage.type;
  const typeRoute = messageType.split('/')[1]
  if (typeRoute === 'cancel'){
      if(ActionManager.cancelAction(char)){
          console.log("An action has been cancelled")
          senderMediator.publish('action_manager', {character: char, msg: "action cancelled"})
      } else {
        senderMediator.publish('action_manager', {character: char, msg: "no active action"})
      }
      
  } else if (typeRoute === 'gather'){
    if (parsedMessage.hasOwnProperty("data")){
      gather(char, parsedMessage.data)
    } else {
      senderMediator.publish('error', {character: char, msg: `Missing property 'data'`})
    }
  } 
  else {
      console.log(`Invalid route for 'type: action/${typeRoute}' attribute.`);
      
      senderMediator.publish('error', {character: char, msg: `Invalid route for 'type: action/${typeRoute}' attribute.`})
  }
}

module.exports = {handleAction}