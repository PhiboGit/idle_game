const ActionManager = require('./actionManager')
const {senderMediator} = require('../../routes/websocket/mediator')

const { regionData } = require('../utils/dataLoader')

function verifyRegionAction(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'region_action' &&
    msg.hasOwnProperty("actionType") && typeof msg.actionType === 'string' && msg.actionType === 'region' &&
    msg.hasOwnProperty("task") && typeof msg.task === 'string' && msg.task === 'gathering' &&
    
    msg.hasOwnProperty("iterations") && typeof msg.iterations === 'number' &&
    Number.isInteger(msg.iterations) &&
    msg.iterations > 0 &&
    
    msg.hasOwnProperty("limit") && typeof msg.limit === 'boolean' &&
    
    msg.args &&
    msg.args.region && typeof msg.args.region === 'string' &&
    msg.args.nodes && Array.isArray(msg.args.nodes) &&
    msg.args.nodes.length <= 50 && msg.args.nodes.length > 0 &&
    msg.args.nodes.every(item => typeof item === 'string') 
    )){
      return true
    }
  console.info('Invalid args for region_action')
  return false
}

function handleRegionAction(character, msg) {
  const valid = verifyRegionAction(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
       msg: {message: "The submitted form for type: 'region_action' is not valid!",
             info: {
              
            }}})
    return
  }

  const region = msg.args.region
  if(!regionData[region]){
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'region_action' is not valid!",
            info: {
             message: "Region does not exist"
           }}})
   return
  }

  const selected_nodes = msg.args.nodes
  for (const node of selected_nodes) {
    let found = false
    for (const terrain of regionData[region].terrain){
      if (terrain.node === node){
        found = true
      }
    }

    if (node === 'nothing' || !found){
      senderMediator.publish('error', {character: character,
        msg: {message: "The submitted form for type: 'region_action' is not valid!",
              info: {
               message: "you cannot select this node!"
             }}})
     return
    }
  }
  
  console.log("region_action is valid!")
  ActionManager.add(character, msg)
}

module.exports = {handleRegionAction}