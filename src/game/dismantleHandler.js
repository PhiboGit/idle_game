const CharacterService = require('./models/services/characterService')
const {senderMediator} = require('../routes/websocket/mediator')
const {rollRange} = require('../game/utils/randomDice')

function verifyDismantle(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'dismantle' &&
    msg.args &&
    msg.args.itemId && typeof msg.args.itemId === 'string'
    )){
      return true
    }
  console.info('Invalid args for dismantle')
  return false
}

async function handleDismantle(character, msg){
  console.log("Handling Dismantle submission...")
  const valid = verifyDismantle(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'dismantle' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling Dismantle submission is valid. Trying to destroy item...")

  const itemId = msg.args.itemId

  const items = await CharacterService.getAllItemsFromCharacter(character)


  if(!(items.includes(itemId))){
    senderMediator.publish('error', {character: character,
      msg: {message: "You do not have the item!",
            info: {
             
           }}})
    return
  }

  const item = await CharacterService.getItem(itemId)

  if(!item){
    senderMediator.publish('error', {character: character,
      msg: {message: "Item does not exist",
            info: {
             
           }}})
    return
  }

  const isItemEquiped = await CharacterService.isItemEquiped(character, itemId)
  if(isItemEquiped){
    senderMediator.publish('error', {character: character,
      msg: {message: "Item is currently equiped!",
            info: {
             
           }}})
    return
  }

  
  await dismantleItem(character, itemId, item.tier, item.type)

  console.log("Handling Dismantle successfully!")
}

async function dismantleItem(character, itemId, tier, itemType){
  const plankAmount = rollRange(1, 3)
  const ingotAmount = rollRange(1, 3)
  const linenAmount = rollRange(1, 3)

  const incrementData = {}
  const pullData = {}
  pullData['items'] = itemId
  incrementData[`resources.plankT${tier}`] = plankAmount
  incrementData[`resources.ingotT${tier}`] = ingotAmount
  incrementData[`resources.linenT${tier}`] = linenAmount

  await CharacterService.increment(character, incrementData, {}, {}, pullData)
  await CharacterService.deleteItem(itemId)
}

module.exports = {handleDismantle}