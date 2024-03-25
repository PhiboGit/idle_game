const CharacterService = require('./models/services/characterService')
const {senderMediator} = require('../routes/websocket/mediator')
const {getSellValueGold} = require('../game/data/vendor')
const {rollRange} = require('./utils/randomDice')

const {resourcesInfo} = require('./data/resourceDetails/resourcesInfo')

function verifySellItem(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'sell/item' &&
    msg.args &&
    msg.args.itemId && typeof msg.args.itemId === 'string'
    )){
      return true
    }
  console.info('Invalid args for sell')
  return false
}

async function handleSellItem(character, msg){
  console.log("Handling Sell submission...")
  const valid = verifySellItem(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'sell' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling Sell submission is valid. Trying to sell item...")

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

  
  await sellItem(character, item)

  console.log("Handling Sell successfully!")
}

async function sellItem(character, item){
  const goldAmount = getSellValueGold(item.tier, item.rarity)

  const incrementData = {}
  const pullData = {}
  pullData['items'] = item._id
  incrementData[`currency.gold`] = goldAmount

  await CharacterService.increment(character, incrementData, {}, {}, pullData)
  await CharacterService.deleteItem(item._id)
}


function verifySellResource(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'sell/resource' &&
    msg.args &&
    msg.args.resourceName && typeof msg.args.resourceName === 'string' &&
    msg.args.amount &&
    typeof msg.args.amount === 'number' &&
    Number.isInteger(msg.args.amount) &&
    msg.args.amount > 0 
    )){
      return true
    }
  console.info('Invalid args for sell')
  return false
}

async function handleSellResource(character, msg){
  console.log("Handling Sell submission...")
  const valid = verifySellResource(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'sell' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling Sell submission is valid. Trying to sell resourceName...")

  const resourceName = msg.args.resourceName
  const amount = msg.args.amount

  const char = await CharacterService.findCharacter(character)


  if(!(char.resources[resourceName] || char.resources[resourceName] > 0 || char.resources[resourceName] >= amount)){
    senderMediator.publish('error', {character: character,
      msg: {message: "You do not have the resource!",
            info: {
             
           }}})
    return
  }
  
  await sellResource(character, resourceName, amount)

  console.log("Handling Sell successfully!")
}

async function sellResource(character, resourceName, amount){

  const info = resourcesInfo[resourceName]

  if(!info || !info.tier || !info.rarity){
    console.log("Resource not found: ", resourceName, info)
    return
  }

  const goldAmount = getSellValueGold(info.tier, info.rarity) * amount

  const incrementData = {}
  incrementData[`resources.${resourceName}`] = -amount
  incrementData[`currency.gold`] = goldAmount

  await CharacterService.increment(character, incrementData, {}, {}, {})
}

module.exports = {handleSellItem, handleSellResource}