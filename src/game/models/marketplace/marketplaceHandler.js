const CharacterService = require('../services/characterService')
const {senderMediator} = require('../../../routes/websocket/mediator')

const MarketplaceService = require('./marketplaceService')
const Marketplace = require('./marketplace')

function verifyOrderBook(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'marketplace/orderBook' &&
    msg.args &&
    msg.args.resource && typeof msg.args.resource === 'string'
    )){
      return true
    }
  console.info('Invalid args for orderBook')
  return false
}

async function handleOrderBook(character, msg){
  console.log("Handling marketplace request...")
  const valid = verifyOrderBook(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'orderBook' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling orderBook submission is valid. Trying to get order book...")

  const resource = msg.args.resource

  const orderBook = await Marketplace.findOne({resource:  resource})


  if(!orderBook){
    senderMediator.publish('error', {character: character,
      msg: {message: "Order book not found!",
            info: {
             
           }}})
    return
  }

  senderMediator.publish('info', {character: character,
    msg: {message: "Order book found!",
          info: 
            orderBook
         }})
  return
}



function verifySellOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'marketplace/sellOrder' &&
    msg.args &&
    msg.args.resource && typeof msg.args.resource === 'string' &&
    msg.args.units && typeof msg.args.units === 'number' && Number.isInteger(msg.args.units) && msg.args.units > 0 &&
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

  const resource = msg.args.resource
  const units = msg.args.units
  const price = msg.args.price
  const days = msg.args.days

  MarketplaceService.postOrder(character, 'sellOrder', resource, price, units, days)
  
  senderMediator.publish('info', {character: character,
    msg: {message: "Sell order accepted!",
          info: {
           
         }}})
  console.log("Handling sellOrder submission successfully!")
}

function verifyBuyOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'marketplace/buyOrder' &&
    msg.args &&
    msg.args.resource && typeof msg.args.resource === 'string' &&
    msg.args.units && typeof msg.args.units === 'number' && Number.isInteger(msg.args.units) && msg.args.units > 0 &&
    msg.args.price && typeof msg.args.price === 'number' && Number.isInteger(msg.args.price) && msg.args.price > 0 &&
    msg.args.days && typeof msg.args.days === 'number' && Number.isInteger(msg.args.days) && msg.args.days > 0 && msg.args.days <= 14
    
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

  const resource = msg.args.resource
  const units = msg.args.units
  const price = msg.args.price
  const days = msg.args.days

  MarketplaceService.postOrder(character, 'buyOrder', resource, price, units, days)
  
  senderMediator.publish('info', {character: character,
    msg: {message: "Buyorder accepted!",
          info: {
           
         }}})
  console.log("Handling buyOrder submission successfully!")
}

function verifyCancelOrder(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'marketplace/cancel' &&
    msg.args &&
    msg.args.orderId && typeof msg.args.orderId === 'string' 
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

  const orderId = msg.args.orderId

  MarketplaceService.cancelOrder(character, orderId)
  
  senderMediator.publish('info', {character: character,
    msg: {message: "Order canceled!",
          info: {
           
         }}})
  console.log("Handling cancel submission successfully!")
}


module.exports = {handleOrderBook, handleSellOrder, handleBuyOrder, handleCancelOrder}