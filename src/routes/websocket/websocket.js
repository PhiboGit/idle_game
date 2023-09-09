const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ noServer: true });

const { senderMediator, receiverMediator } = require('./mediator');
const MessageReceiver = require('./messageReceiver');
const MessageSender = require('./messageSender');

const mapCharWS = new Map();
const mapWSChar = new Map();

const messageReceiver = new MessageReceiver(receiverMediator);
const messageSender = new MessageSender(senderMediator, mapCharWS);

function onSocketPostError(e) {
  console.log(e);
}

function addWS(ws, char) {
  mapCharWS.set(char, ws);
  mapWSChar.set(ws, char);
}

function deleteWS(ws) {
  const char = mapWSChar.get(ws);
  mapCharWS.delete(char);
  mapWSChar.delete(ws);
}

wss.on('connection', (ws, req, infos) => {

  ws.on('error', onSocketPostError);
  console.log('Connected to websocket!');
  const charName = infos.characterName;

  addWS(ws, charName);

  receiverMediator.publish('init', { character: charName });

  ws.on('message', function message(msg) {
    const character = mapWSChar.get(ws);
    console.log(`Message received from ${character}`);
    receiverMediator.publish('message', { character: charName, msg: msg });
  });

  ws.on('close', () => {
    const character = mapWSChar.get(ws);
    deleteWS(ws);
    console.log(`Connection closed: ${character}`);
  });

});

module.exports = { wss };
