const {WebSocket} = require('ws');

class MessageSender{
  constructor(mediator, mapCharWSArray) {
    this.mediator = mediator;
    this.mapCharWSArray = mapCharWSArray;

    // Subscribe to relevant events from the mediator
    this.mediator.subscribe('init', this.init_EventHandler.bind(this));
    this.mediator.subscribe('init_data', this.initData_EventHandler.bind(this));
    this.mediator.subscribe('error', this.error_EventHandler.bind(this));
    this.mediator.subscribe('action_manager', this.actionManager_EventHandler.bind(this));
    this.mediator.subscribe('info', this.info_EventHandler.bind(this));
    this.mediator.subscribe('broadcast_chat', this.chat_EventHandler.bind(this))
    this.mediator.subscribe('time', this.time_EventHandler.bind(this))
    this.mediator.subscribe('update_char', this.updateChar_EventHandler.bind(this))
    this.mediator.subscribe('actionManager', this.actionManager_EventHandler.bind(this))
    this.mediator.subscribe('item_update', this.items_EventHandler.bind(this))
    this.mediator.subscribe('order', this.order_EventHandler.bind(this))
    this.mediator.subscribe('item_order', this.itemOrder_EventHandler.bind(this))
    this.mediator.subscribe('marketplace', this.marketplace_EventHandler.bind(this))
    this.mediator.subscribe('item_marketplace', this.itemMarketplace_EventHandler.bind(this))
  }

  marketplace_EventHandler(data) {
    console.log('MessageSender event: "marketplace" invoked.');
    verifyData(data)
    
    const message = {
      type: 'marketplace',
      data: data.msg
    }

    this.send(data.character, message)
  }

  itemMarketplace_EventHandler(data) {
    console.log('MessageSender event: "item_marketplace" invoked.');
    verifyData(data)
    
    const message = {
      type: 'item_marketplace',
      data: data.msg
    }

    this.send(data.character, message)
  }

  itemOrder_EventHandler(data) {
    console.log('MessageSender event: "item_order" invoked.');
    verifyData(data)
    
    const message = {
      type: 'item_order',
      data: data.msg
    }

    this.send(data.character, message)
  }

  order_EventHandler(data) {
    console.log('MessageSender event: "order" invoked.');
    verifyData(data)
    
    const message = {
      type: 'order',
      data: data.msg
    }

    this.send(data.character, message)
  }

  items_EventHandler(data) {
    console.log('MessageSender event: "item_update" invoked.');
    verifyData(data)
    
    const message = {
      type: 'item_update',
      data: data.msg
    }

    this.send(data.character, message)
  }

  actionManager_EventHandler(data) {
    console.log('MessageSender event: "actionManager" invoked.');
    verifyData(data)
    
    const message = {
      type: 'actionManager',
      data: data.msg
    }

    this.send(data.character, message)
  }

  updateChar_EventHandler(data) {
    console.log('MessageSender event: "update_char" invoked.');
    verifyData(data)
    
    const message = {
      type: 'update_char',
      data: data.msg
    }

    this.send(data.character, message)
  }

  time_EventHandler(data) {
    console.log('MessageSender event: "time" invoked.');
    verifyData(data)
    
    const message = {
      type: 'time',
      data: data.msg
    }

    this.send(data.character, message)
  }

  error_EventHandler(data) {
    console.log('MessageSender event: "error" invoked.');
    verifyData(data)
    
    const message = {
      type: 'error',
      data: data.msg
    }

    this.send(data.character, message)
  }

  chat_EventHandler(data) {
    console.log('MessageSender event: "chat" invoked.');
    verifyData(data)
    this.mapCharWSArray.forEach((array, char) => {
      array.forEach((clientWS, index) => {
        if (clientWS.readyState === WebSocket.OPEN) {
          const message = {
            type: 'chat',
            data: {
              sender: data.character,
              message: data.msg
            }
          }
          clientWS.send(JSON.stringify(message));
        }
      })
    })
  }

  info_EventHandler(data) {
    console.log('MessageSender event: "info" invoked.');
    verifyData(data)
    
    const message = {
      type: 'info',
      data: data.msg
    }

    this.send(data.character, message)
  }

  actionManager_EventHandler(data) {
    console.log('MessageSender event: "action_manager" invoked.');
    verifyData(data)
    
    const message = {
      type: 'action_manager',
      data: data.msg
    }

    this.send(data.character, message)
  }

  init_EventHandler(data) {
    console.log('MessageSender event: "init" invoked.');
    verifyData(data)
    
    const message = {
      type: 'init_character',
      activePlayer: this.mapCharWSArray.size,
      data: data.msg,
      
    }

    this.send(data.character, message)
  }

  initData_EventHandler(data) {
    console.log('MessageSender event: "init_data" invoked.');
    verifyData(data)
    
    const message = {
      type: 'init_data',
      data: data.msg,
      
    }

    this.send(data.character, message)
  }

  send(char, message) {
    const wsArray = this.mapCharWSArray.get(char)
    if (!wsArray){
      console.log(`${char} is not connected to a WebSocket`)
      return
    }
    for (const ws of wsArray){
      ws.send(JSON.stringify(message))
    }
    console.log(`WebSocket message ${message.type} send to: ${char}, has ${wsArray.length} open connections!`)
  }
}

function verifyData(data){
  //console.log('VerifyData: ', data)
  const char = data.character
  if(!char || typeof char !== 'string'){
    throw new Error('Invalid character. Must have "character" property and oftype string!')
  }
  const msg = data.msg
  
  if(!typeof msg === 'string' && !isJSONObject(msg)){
    throw new Error('Invalid message. Must have "msg" property and be JSON conform!')
  }
}

function isJSONObject(obj) {
  try {
    const jsonString = JSON.stringify(obj);
    const parsedObject = JSON.parse(jsonString);
    return typeof parsedObject === 'object' && parsedObject !== null;
  } catch (error) {
    console.log('Error parsing JSON')
    return false;
  }
}

module.exports = MessageSender