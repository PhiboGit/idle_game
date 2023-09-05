const {handleAction} = require('../../game/actions/actionRouter')
const {senderMediator} = require('./mediator')

// Define a configuration object for message routing
const messageRoutes = {
  'action': handleAction,
  'getTime': handleGetTime,
  'broadcast': handleBroadcast,
};


function routeMessage(character, msgJson) {
  const messageType = msgJson.type
  const typeRoute = messageType.split('/')[0]

  // handle the routes recieved from ws message
  if (typeRoute === 'action') {
    handleAction(character, msgJson)
  } else if (typeRoute === "getTime") {
    handleGetTime(character)
  } else if (typeRoute === "broadcast") {
    handleBroadcast(character, msgJson)
  } else {
    console.log("Invalid route for 'type' attribute.")
    senderMediator.publish('error', {character: character, msg: "Invalid route for 'type' attribute." })
  }
}


function handleGetTime(character){
  time = Date.now()
  senderMediator.publish('time', {character: character, msg: time })
}

function handleBroadcast(character, msgJson){
  if (!msgJson.hasOwnProperty("data")){
    senderMediator.publish('error', {character: character, msg: "Does not have property 'data'!" })
    return
  }
  const data = msgJson.data
  if (!typeof data === 'string'){
    senderMediator.publish('error', {character: character, msg: "Property 'data' is not typof 'string'!" })
    return
  }

  senderMediator.publish('broadcast_chat', {character: character, msg: data })
}

module.exports = routeMessage