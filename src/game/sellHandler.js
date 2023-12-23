const CharacterService = require('./models/services/characterService')
const {senderMediator} = require('../routes/websocket/mediator')
const {getSellValueGold} = require('../game/data/vendor')
const {rollRange} = require('./utils/randomDice')

function verifySellItem(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'sell' &&
    msg.args &&
    msg.args.itemId && typeof msg.args.itemId === 'string'
    )){
      return true
    }
  console.info('Invalid args for sell')
  return false
}

async function handleSell(character, msg){
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

module.exports = {handleSell}