const CharacterService = require('./models/services/characterService')
const {senderMediator} = require('../routes/websocket/mediator')

const validSkills = [
  'woodcutting', 
  'mining',
  'harvesting'
]

const equipmentSlots = [
  "tool",
  "head",
  "chest",
  "hands",
  "legs",
  "feet"
]

function verifyEquip(msg){
  if((msg && 
    msg.type && typeof msg.type === 'string' && msg.type === 'equip' &&
    msg.args &&
    msg.args.itemId && typeof msg.args.itemId === 'string' && 
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

  const itemId = msg.args.itemId
  const skillSlot = msg.args.skill
  const equipSlot = msg.args.slot

  // to unequip an item
  if(itemId == "null"){
    console.log("Handling Equip successfully!")
    CharacterService.equipItem(character, null, skillSlot, equipSlot)
    return
  }

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

  
  if (!(item.skills.includes(skillSlot))) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip this item here!",
      info: {
        
      }}})
    return
  }
    
  if (!(item.type == equipSlot)) {
    senderMediator.publish('error', {character: character,
      msg: {message: "You cannot equip this item in this slot!",
      info: {
        
      }}})
    return
  }
  
  
  skillData = await CharacterService.getSkillData(character, skillSlot)
  

  if (!(skillData.level >= item.level)) {
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

  
  CharacterService.equipItem(character, itemId, skillSlot, equipSlot)
  console.log("Handling Equip successfully!")
}

module.exports = {handleEquip}