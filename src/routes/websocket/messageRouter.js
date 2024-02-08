const ActionHandler = require('../../game/actions/actionHandler')
const RegionActionHandler = require('../../game/actions/regionActionHandler')
const EquipHandler = require('../../game/equipHandler')
const SellHandler = require('../../game/sellHandler')
const MarketplaceHandler = require('../../game/models/marketplace/marketplaceHandler')
const ItemMarketplaceHandler = require('../../game/models/marketplace/itemMarketplaceHandler')
const {senderMediator} = require('./mediator')

// Define a configuration object for message routing
const messageRoutes = {
  'action': ActionHandler.handleAction,
  'region_action': RegionActionHandler.handleRegionAction,
  'cancel': ActionHandler.handleCancel,
  'equip': EquipHandler.handleEquip,
  'sell': {
    'item': SellHandler.handleSellItem,
    'resource': SellHandler.handleSellResource,
  },
  'getTime': handleGetTime,
  'broadcast': handleBroadcast,

  'marketplace': {
    'orderBook': MarketplaceHandler.handleOrderBook,
    'sellOrder': MarketplaceHandler.handleSellOrder,
    'buyOrder': MarketplaceHandler.handleBuyOrder,
    'cancel': MarketplaceHandler.handleCancelOrder,
    'collect': MarketplaceHandler.handleCollectOrder
  },

  'item_marketplace': {
    'orderBook': ItemMarketplaceHandler.handleOrderBook,
    'sellOrder': ItemMarketplaceHandler.handleSellOrder,
    'buyOrder': ItemMarketplaceHandler.handleBuyOrder,
    'cancel': ItemMarketplaceHandler.handleCancelOrder,
    'collect': ItemMarketplaceHandler.handleCollectOrder
  },
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