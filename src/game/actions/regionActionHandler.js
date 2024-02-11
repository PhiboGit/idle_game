const ActionManager = require('./actionManager')
const {senderMediator} = require('../../routes/websocket/mediator')

const { regionData } = require('../utils/dataLoader')

function verifyRegionAction(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'region_action' &&
    msg.hasOwnProperty("task") && typeof msg.task === 'string' && msg.task === 'gathering' &&
    
    
    msg.args &&
    msg.args.limit && typeof msg.args.limit === 'boolean' &&
    msg.args.region && typeof msg.args.region === 'string' &&
    msg.args.nodes && Array.isArray(msg.args.nodes) &&
    msg.args.nodes.length <= 50 && msg.args.nodes.length > 0 &&
    msg.args.nodes.every(item => (
      item && item.node && typeof item.node ==='string' &&
      item.iterations && typeof item.iterations ==='number' && Number.isInteger(item.iterations) && item.iterations > 0)) 
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

  const nodes = msg.args.nodes
  for (const item of nodes) {
    const node = item.node
    // add a counter
    item["counter"] = 0;
    let found = false
    for (const terrain of regionData[region].terrain){
      if (terrain.node === node){
        found = true
      }
    }
    // the node does not exist for this region
    if (!found){
      senderMediator.publish('error', {character: character,
        msg: {message: "The submitted form for type: 'region_action' is not valid!",
              info: {
               message: "you cannot select this node!"
             }}})
     return
    }
  }
  
  console.log("region_action is valid!")
  msg["iterations"] = 1
  msg["actionType"] = region
  msg["limit"] = true

  // attatch the info
  msg["info"] = {
    traveled: false,
    travelCount: 0,
    timeSpentTraveling: 0,
    lastNode: null,
  }

  ActionManager.add(character, msg)
}

module.exports = {handleRegionAction}