const {senderMediator} = require('./mediator')
const CharacterService = require('../../game/models/services/characterService')
const routeMessage = require('./messageRouter')

const {gatheringResourcesData,regionData, gatheringEXPData, recipesData, refiningRecipes, craftingTable, craftingMaterials, enchantingProfession} = require('../../game/utils/dataLoader')
const { resourcesInfo } = require('../../game/data/resourceDetails/resourcesInfo')

class MessageReceiver{
  constructor(mediator) {
    this.mediator = mediator;

    // Subscribe to relevant events from the mediator
    this.mediator.subscribe('init', this.init_EventHandler.bind(this));
    this.mediator.subscribe('message', this.message_EventHandler.bind(this));
  
  }

  init_EventHandler(data) {
    console.log('MessageReceiver.init', data);
    initializeCharacter(data.character)
    initData(data.character)
  }

  message_EventHandler(data) {
    const char = data.character
    const msgJson = parseJSON(data.msg)
    data.msg = msgJson
    console.log('MessageReceiver.message', data);

    if (!msgJson){
      senderMediator.publish('error', {character: char, msg: 'Invalid message format. Not a JSON' })
      return
    }
    if (!msgJson.hasOwnProperty("type")) {
      console.log("Message has no 'type' property.")
      senderMediator.publish('error', {character: char, msg: "Message has no 'type' property." })
      return
    }

    routeMessage(char, msgJson)
  }
}

// move this down to the game files
async function initializeCharacter(charName) {
  try {
      const character = await CharacterService.findCharacter(charName);

      if (character) {
          // Wrap the character JSON in an object and add a type attribute
          const characterMessage = {
              character: character
              // add more character data
          };

          senderMediator.publish('init', {character: charName, msg: characterMessage})
      } else {
          console.log('Character not found');
      }
  } catch (error) {
      console.error('Error fetching character:', error);
  }
}

// move this down to the game files
async function initData(charName) {
  try {

    const database = {
      resourcesInfo,
      expTable: gatheringEXPData,
      gatheringResourcesData,
      regionData,
      recipesData,
      refiningRecipes,
      craftingTable,
      craftingMaterials,
      enchantingProfession
    }  

    senderMediator.publish('init_data', {character: charName, msg: database})
      
  } catch (error) {
      console.error('Error fetching character:', error);
  }
}

function parseJSON(msg) {
  try {
    const parsedMessage = JSON.parse(msg)
    return parsedMessage
  } catch (error) {
    console.log("ERROR in validateJSON: Invalid Message, Not a JSON");        
  }
  return undefined
}

module.exports = MessageReceiver