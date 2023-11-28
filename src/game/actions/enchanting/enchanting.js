const CharacterService = require('../../models/services/characterService')
const {enchantingProfession} = require('../../utils/dataLoader')
const {getActionTime, initAction} = require('../actionUtils')
const {enchantTool} = require('../../models/items/tool/toolEnchant')

async function validate(character, actionObject) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const itemId = actionObject.args.itemId
    const enchantingResource = actionObject.args.enchantingResource
    const enchantingLevelLimit = actionObject.args.enchantingLevelLimit

    const characterDB = await CharacterService.findCharacter(character)
    console.log(`init Validation ${skillName}-${task}...`)

    const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${enchantingResource}`) || 0;
    if (inventoryValue < 1) {
      console.log(`${character} does not have the required resources. has ${inventoryValue} ${enchantingResource} but needs 1!`);
      reject('amount');
    }

    const characterItemsIdList = await CharacterService.getAllItemsFromCharacter(character)
    if (!characterItemsIdList.some(item => item == itemId)){
      console.log(`${character} does not have the selected item with id ${itemId}!`);
      reject('amount');
    }
    const item = await CharacterService.getItem(itemId)
    const characterSkill = await CharacterService.getEnchantingSkill(character, skillName);

    if(characterSkill.level < enchantingProfession[`T${item.tier}`].level){
      console.log(`${character} does not have the required level. Is ${characterSkill.level} but needs ${enchantingProfession[`T${item.tier}`].level}`)
      reject('level');
    }

    const itemName = `${item.subtype}T${item.tier}`
    if(!itemName == enchantingResource.split('_')[0]){
      console.log(`Cannot enchant the selected item ${itemName} with ${enchantingResource}!`)
      reject('ingredient');
    }
    
    if(item.enchantingLevel >= enchantingLevelLimit){
      console.log(`The item has reached the selected enchanting level!`)
      reject('ingredient');
    }

    console.log(`Validation ${skillName}-${task} complete.`)
    // get the time
    const actionTime = getActionTime(enchantingProfession[`T${item.tier}`].time, characterSkill.speed)

    resolve(actionTime)
    return
  });
}

async function start(character, actionObject, activeTimeout) {
  return new Promise(async (resolve, reject) => {
    const skillName = actionObject.actionType
    const task = actionObject.task
    const actionTime = actionObject.actionTime
    const itemId = actionObject.args.itemId
    const enchantingResource = actionObject.args.enchantingResource
    initAction(resolve, reject, activeTimeout, character, actionTime, enchanting, [character, skillName, task, itemId, enchantingResource])
  });
}


/**
 * Does everything after the action has finished.
 * Calculating loot, exp gains, etc.
 * 
 * Then updates the character.
 * 
 * @param {String} character 
 * @param {String} skillName 
 * @param {String} recipeName
 * @param {Set} selectedIngredients
 * @param {Set} selectedUpgrades 
*/
async function enchanting(character, skillName, task, itemId, enchantingResource) {
  console.log('enchanting in progress...')

  const characterSkill = await CharacterService.getEnchantingSkill(character, skillName);
  const item = await CharacterService.getItem(itemId)
	// filling out the form to increment the values of a character
	const incrementData = {}
  incrementData['exp'] = enchantingProfession[`T${item.tier}`].expChar 
  incrementData[`skills.${skillName}.exp`] = (enchantingProfession[`T${item.tier}`].exp * ( 1 + characterSkill.expBonus))
  
  // check ingredients
  const characterDB = await CharacterService.findCharacter(character)
  const inventoryValue = CharacterService.getFieldValue(characterDB, `resources.${enchantingResource}`) || 0;
  if (inventoryValue < 1) {
    console.log(`${character} does not have the required resources. has ${inventoryValue} ${enchantingResource} but needs 1!`);
    return false
  }
  incrementData[`resources.${item.resource}`] = -1
  
  switch (item.type) {
    case "tool":
      await enchantTool(item, enchantingResource, characterSkill)
      break;
  
    default:
      console.error(`Cannot enchant ${item.type}!`);
      break;
  }
	// At last update all the values for the character.
	await CharacterService.increment(character, incrementData, {}, {}, {})
  await CharacterService.itemUpdate(character, [item._id])
	return true
}

module.exports = {validate, start};