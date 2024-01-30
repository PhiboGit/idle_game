const CharacterService = require('../services/characterService')
const {senderMediator} = require('../../../routes/websocket/mediator')

const ItemMarketplaceService = require('./itemMarketplaceService')
const ItemMarketplace = require('./itemMarketplace')

function verifyOrderBook(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'item_marketplace/orderBook' &&
    msg.args &&
    msg.args.itemName && typeof msg.args.itemName === 'string'
    )){
      return true
    }
  console.info('Invalid args for itemorderBook')
  return false
}

async function handleOrderBook(character, msg){
  console.log("Handling marketplace request...")
  const valid = verifyOrderBook(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'itemorderBook' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling itemorderBook submission is valid. Trying to get order book...")

  const itemName = msg.args.itemName

  const orderBook = await ItemMarketplace.findOne({itemName:  itemName}).populate({
    path: 'orderBook',
    // Get item of order - populate the 'item' array for every order
    populate: { path: 'item' }
  }).lean()


  if(!orderBook){
    senderMediator.publish('error', {character: character,
      msg: {message: "Order book not found!",
            info: {
             
           }}})
    return
  }

  senderMediator.publish('item_marketplace', {character: character,
    msg: {orderBook}})
  return
}



function verifySellOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'item_marketplace/sellOrder' &&
    msg.args &&
    msg.args.itemId && typeof msg.args.itemId === 'string' &&
    msg.args.price && typeof msg.args.price === 'number' && Number.isInteger(msg.args.price) && msg.args.price > 0 &&
    msg.args.days && typeof msg.args.days === 'number' && Number.isInteger(msg.args.days) && msg.args.days > 0 && msg.args.days <= 14
    
    )){
      return true
    }
  console.info('Invalid args for sellOrder')
  return false
}


async function handleSellOrder(character, msg){
  console.log("Handling marketplace sellOrder...")
  const valid = verifySellOrder(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'sellOrder' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling sellOrder submission is valid. Trying to post order ...")

  const itemId = msg.args.itemId
  const price = msg.args.price
  const days = msg.args.days

  ItemMarketplaceService.sellOrder(character, itemId, price, days)
  
  console.log("Handling sellOrder submission successfully!")
}

function verifyBuyOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'item_marketplace/buyOrder' &&
    msg.args &&
    msg.args.item_orderId && typeof msg.args.item_orderId === 'string'
    )){
      return true
    }
  console.info('Invalid args for buyOrder')
  return false
}


async function handleBuyOrder(character, msg){
  console.log("Handling marketplace buyOrder...")
  const valid = verifyBuyOrder(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'buyOrder' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling buyOrder submission is valid. Trying to post order ...")

  const item_orderId = msg.args.item_orderId

  ItemMarketplaceService.buyOrder(character, item_orderId)
  
  console.log("Handling buyOrder submission successfully!")
}

function verifyCancelOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'item_marketplace/cancel' &&
    msg.args &&
    msg.args.item_orderId && typeof msg.args.item_orderId === 'string' 
    )){
      return true
    }
  console.info('Invalid args for cancel order')
  return false
}


async function handleCancelOrder(character, msg){
  console.log("Handling marketplace cancel order...")
  const valid = verifyCancelOrder(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'cancel' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling cancel submission is valid. Trying to cancel order ...")

  const item_orderId = msg.args.item_orderId

  ItemMarketplaceService.cancelOrder(character, item_orderId)
  
  console.log("Handling cancel submission successfully!")
}

function verifyCollectOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'item_marketplace/collect' &&
    msg.args &&
    msg.args.item_orderId && typeof msg.args.item_orderId === 'string' 
    )){
      return true
    }
  console.info('Invalid args for collect order')
  return false
}


async function handleCollectOrder(character, msg){
  console.log("Handling marketplace collect order...")
  const valid = verifyCollectOrder(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'collect' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling collect submission is valid. Trying to collect order ...")

  const item_orderId = msg.args.item_orderId

  ItemMarketplaceService.collectOrder(character, item_orderId)
  
  console.log("Handling collect submission successfully!")
}


module.exports = {handleSellOrder, handleBuyOrder, handleCancelOrder, handleCollectOrder, handleOrderBook}