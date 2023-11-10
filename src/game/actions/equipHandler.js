const CharacterService = require('../models/services/characterService')
const {senderMediator} = require('../../routes/websocket/mediator')

const validSkills = [
  'woodcutting', 
  'mining',
  'harvesting'
]

const equipmentSlots = [
  "tool"
]

function verifyEquip(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'equip' &&
    msg.args &&
    msg.args.itemID && typeof msg.args.itemID === 'string' && 
    msg.args.skill && typeof msg.args.skill === 'string' && validSkills.includes(msg.args.skill) &&
    msg.args.slot && typeof msg.args.slot === 'string' && equipmentSlots.includes(msg.args.slot)
    )){
      return true
    }
  console.info('Invalid args for equip')
  return false
}

async function handleEquip(character, msg){
  console.log("Handling Equip submission...")
  const valid = verifyEquip(msg)
  if (!valid) {
    senderMediator.publish('error', {character: character,
      msg: {message: "The submitted form for type: 'equip' is not valid!",
            info: {
             
           }}})
    return
  }
  console.log("Handling Equip submission is valid. Trying to equip item...")

  const itemID = msg.args.itemID
  const skillSlot = msg.args.skill
  const equipSlot = msg.args.slot

  const items = await CharacterService.getAllItemsFromCharacter(character)


  if(!(items.includes(itemID))){
    senderMediator.publish('error', {character: character,
      msg: {message: "You do not have the item!",
            info: {
             
           }}})
    return
  }

  const item = await CharacterService.getItem(itemID)

  if(!item){
    senderMediator.publish('error', {character: character,
      msg: {message: "Item does not exist",
            info: {
             
           }}})
    return
  }

  const skill = await CharacterService.getSkill(character, skillSlot)

  const validSubtype = {
    "mining": ["pickaxe"],
    "woodcutting": ["axe"],
    "harvesting": ["sickle"],
  }

  if (!(item.type == equipSlot)) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip this item in this slot!",
      info: {
        
      }}})
    return
  }

  if (!(validSubtype[`${skillSlot}`].includes(item.subtype))) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip this item here!",
      info: {
        
      }}})
    return
  }

  if (!(skill.level >= item.level)) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You do not have the required level!",
      info: {
        
      }}})
    return
  }
    
  const runningAction = await CharacterService.getActiveAction(character)

  if ((runningAction == skillSlot)) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip for a running action!",
            info: {
             
           }}})
    return
  }

  console.log("Handling Equip successfully!")

  CharacterService.equipSkillItem(character, itemID, skillSlot, equipSlot)
}

module.exports = {handleEquip}