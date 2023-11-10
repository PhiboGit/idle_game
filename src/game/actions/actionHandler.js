const ActionManager = require('./actionManager')
const CharacterService = require('../models/services/characterService')
const {verifyAction, verifyEquip} = require('./actionVerifier')
const {senderMediator} = require('../../routes/websocket/mediator')
const { skills } = require('../models/skills')


function handleCancel(character, msg) {
  if(!(msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'cancel' && 
    msg.index && typeof msg.index === 'number' && Number.isInteger(msg.index) &&
    msg.index >= -1 && msg.index <= 4
    )){
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'cancel' is not valid!",
            info: {
             index: 'Number/Integer: -1 to 4, -1 is the current running action, else the index of the Queue.',
           }}})
    return
  }

  ActionManager.cancelAction(character, msg.index)
}

function handleAction(character, msg) {
  const valid = verifyAction(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
       msg: {message: "The submitted form for type: 'action' is not valid!",
             info: {
              not_implemented: "Server: Info is not implemented with a return value"
            }}})
    return
  }

  ActionManager.add(character, msg.actionType, msg.args)
}

async function handleEquip(character, msg){
  const valid = verifyEquip(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'equip' is not valid!",
            info: {
             
           }}})
    return
  }

  const items = await CharacterService.getAllItemsFromCharacter(character)

  if(!items.includes(msg.args.itemID)){
    senderMediator.publish('error', {character: character,
      msg: {message: "You do not have the item!",
            info: {
             
           }}})
    return
  }

  const item = await CharacterService.getItem(msg.args.itemID)

  if(!item){
    senderMediator.publish('error', {character: character,
      msg: {message: "Item does not exist",
            info: {
             
           }}})
    return
  }

  const skill = await CharacterService.getSkill(character, msg.args.skill)

  const validSubtype = {
    "mining": ["pickaxe"]
  }

  if (!(item.type == msg.args.slot && validSubtype[`${msg.args.skill}`].includes(item.subtype) && skill.level >= item.level)) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip this item here!",
            info: {
             
           }}})
    return
  }


  CharacterService.equipSkillItem(character, msg.args.itemID, msg.args.skill, msg.args.slot)
  
}

module.exports = {handleCancel, handleAction, handleEquip}