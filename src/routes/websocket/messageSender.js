const {WebSocket} = require('ws');

class MessageSender{
  constructor(mediator, mapCharWS) {
    this.mediator = mediator;
    this.mapCharWS = mapCharWS;

    // Subscribe to relevant events from the mediator
    this.mediator.subscribe('init', this.init_EventHandler.bind(this));
    this.mediator.subscribe('error', this.error_EventHandler.bind(this));
    this.mediator.subscribe('action_manager', this.actionManager_EventHandler.bind(this));
    this.mediator.subscribe('info', this.info_EventHandler.bind(this));
    this.mediator.subscribe('broadcast_chat', this.chat_EventHandler.bind(this))
    this.mediator.subscribe('time', this.time_EventHandler.bind(this))
    this.mediator.subscribe('update_char', this.updateChar_EventHandler.bind(this))
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
    this.mapCharWS.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        const message = {
          type: 'chat',
          data: {
            sender: data.character,
            message: data.msg
          }
        }
        client.send(JSON.stringify(message));
      }
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
      activePlayer: this.mapCharWS.size,
      data: data.msg,
      
    }

    this.send(data.character, message)
  }

  send(char, message) {
    const ws = this.mapCharWS.get(char)
    if (!ws){
      console.log(`${char} is not connected to a WebSocket`)
      return
    }
    ws.send(JSON.stringify(message))
    console.log(`WebSocket message send to: ${char}`)
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