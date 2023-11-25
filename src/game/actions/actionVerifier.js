const availableActions = {
  "woodcutting": ["gathering"],
  "mining": ["gathering"],
  "harvesting": ["gathering"],

  "woodworking": ["crafting"],
  "smelting": ["crafting"],
  "weaving": ["crafting"],

  "toolsmith": ["crafting", "upgrading"],

  "enchanter": ["enchanting"]
}

function verifyAction(msg){

  /**
   *  should have:
   *  "type": "action",
	    "actionType" : "smelting",
      "task": "crafting",
      "limit": true,
      "iterations": 100,
      "args": {
        ...
      }
   */
  if(!(msg && 
      msg.hasOwnProperty("type") && typeof msg.type === 'string' && msg.type === 'action' && 
      msg.hasOwnProperty("actionType") && typeof msg.actionType === 'string' &&
      msg.hasOwnProperty("task") && typeof msg.task === 'string' &&
      
      msg.hasOwnProperty("iterations") && typeof msg.iterations === 'number' &&
      Number.isInteger(msg.iterations) &&
      msg.iterations > 0 &&
      
      msg.hasOwnProperty("limit") && typeof msg.limit === 'boolean' &&
      msg.hasOwnProperty("args"))){
        console.log('Invalid msg! msg doees not have property {type: "action", actionType: String, task: String, args:{...}}')
        return false
  }

  // is one of the valid actions
  if(!availableActions[msg.actionType]){
    console.log('Invalid msg! Invalid actionType: ', msg.actionType)
    return false
  }

  // the selected profession can do the task
  if(!availableActions[msg.actionType].includes(msg.task)){
    console.log(`Invalid msg! Invalid task "${msg.task}" for this actionType "${msg.actionType}"`)
    return false
  }

  // verify the args for the selected task
  switch (msg.task) {
    case "gathering":
      return verifyGatheringArgs(msg.args)
      break;
    case "crafting":
      return verifyCraftingArgs(msg.args)
      break
    case "upgrading":
      return verifyUpgradingArgs(msg.args)
      break
    case "enchanting":
      return verifyEnchantingArgs(msg.args)
    default:
      console.log(`Invalid msg! Invalid task "${msg.task}" for this actionType "${msg.actionType}"`)
      return false
      break;
  }
}


// "args": {
//   "tier": 1,
//   "limit": true,
//   "iterations": 100
// }
function verifyGatheringArgs(args){
	if(
    args.hasOwnProperty("tier") &&
		typeof args.tier === 'number' &&
		Number.isInteger(args.tier) &&
		args.tier > 0 && args.tier <=5
		){
			return true
		}
	console.info('Invalid args for gathering!')
	return false
}

// "args": {
//   "recipe": "plankT1",
//   "limit": true,
//   "iterations": 100,
//   "ingredients": [
//       "woodT1"
//   ]
// }
function verifyCraftingArgs(args){
	if(
    args.hasOwnProperty("recipe") &&
		typeof args.recipe === 'string' &&

    args.hasOwnProperty("ingredients") &&
    !args.hasOwnProperty("upgrades") &&
    Array.isArray(args.ingredients) &&
    args.ingredients.length <= 10 &&
    args.ingredients.every(item => typeof item === 'string')
		){
      // Remove duplicates from ingredients arrays in place
      args.ingredients = [...new Set(args.ingredients)];
      return true
    }
	console.info('Invalid args for crafting!')
	return false
}

// "args": {
//   "recipe": "pickaxeT1",
//   "limit": true,
//   "iterations": 1,
//   "upgrades": [
//       "pickaxeT1_common",
//       "miningSpeedCharm"
//   ]
// }
function verifyUpgradingArgs(args){
	if(
    args.hasOwnProperty("recipe") &&
		typeof args.recipe === 'string' &&

    args.hasOwnProperty("upgrades") &&
    !args.hasOwnProperty("ingredients") &&
    Array.isArray(args.upgrades) &&
    args.upgrades.length <= 10 &&
    args.upgrades.every(item => typeof item === 'string')
		){
      // Remove duplicates from upgrades arrays in place
      args.upgrades = [...new Set(args.upgrades)];
      return true
    }
	console.info('Invalid args for upgrading!')
	return false
}

function verifyEnchantingArgs(args){
  if(
    args.hasOwnProperty("itemId") &&
		typeof args.itemId === 'string' &&
		
    args.hasOwnProperty("enchantingResource") &&
		typeof args.enchantingResource === 'string'
		){
			return true
		}
	console.info('Invalid args for enchanting!')
	return false
}

module.exports = {verifyAction}