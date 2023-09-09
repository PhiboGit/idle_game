const ActionHandler = require('../../game/actions/actionHandler')
const {senderMediator} = require('./mediator')

// Define a configuration object for message routing
const messageRoutes = {
  'action': {
    'cancel': ActionHandler.handleCancel,
    'gather': ActionHandler.handleGathering,
    'refining': undefined,
    'crafting': undefined,
    'combat': undefined
  },
  'getTime': handleGetTime,
  'broadcast': handleBroadcast,
};


function routeMessage(character, msgJson) {
  const messageType = msgJson.type
  if (!messageType || typeof messageType !== 'string') {
    senderMediator.publish('error', {character: character, msg: "Does not have property 'type', or value is not a 'string'!" })
    return
  }

  const typeRoute = messageType.split('/')
  let currentRoute = messageRoutes

  for (const routeSegment of typeRoute) {
    const handler = currentRoute[routeSegment]
    if (!handler) {
      console.log("Invalid route for 'type' attribute.")
      senderMediator.publish('error', {character: character, msg: `No route found for type ${messageType}. Segment:  ${routeSegment} is not defined!` })
      return
    }
    if (typeof handler === 'function') {
      handler(character, msgJson)
      return
    }
    currentRoute = currentRoute[routeSegment]
  }
}


function handleGetTime(character, msgJson){
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