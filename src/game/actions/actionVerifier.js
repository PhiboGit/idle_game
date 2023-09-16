const gatheringActions = [
  'woodcutting', 
  'mining',
  'harvesting',
]

const craftingActions = [
  'woodworking',
  'smelting',
  'weaving',
]


const actionTypes =  [...craftingActions, ...gatheringActions]

function verify(msg){

  /**
   *  should have:
   *  "type": "action",
	    "actionType" : "smelting",
   */
  if(!(msg && 
      msg.hasOwnProperty("type") && typeof msg.type === 'string' && msg.type === 'action' && 
      msg.hasOwnProperty("actionType") && typeof msg.actionType === 'string' &&
      msg.hasOwnProperty("args"))){
        console.log('Invalid msg! msg doees not have property {type: "action", actionType: String, args:{}}')
        return false
  }

  // is one of the valid actions
  if(!actionTypes.includes(msg.actionType)){
    console.log('Invalid msg! Invalid actionType: ', msg.actionType)
    return false
  }

  /**
   * should have args with a tier
   * 
   *  "args": {
        "tier": 1,
        "limit": true,
        "iterations": 20
      }
   */ 
  if(gatheringActions.includes(msg.actionType)){
    return verifyGatheringArgs(msg.args)
  }

  /**
   * should have args with a recipe
   * "args": {
      "recipe": "ingotT1",
      "limit": true,
      "iterations": 20
    }
   */
  if(craftingActions.includes(msg.actionType)){
    return verifyCraftingArgs(msg.args)
  }

  console.log('Invalid msg! Could not verify action')
  return false
}

function verifyGatheringArgs(args){
	if(
    args.hasOwnProperty("tier") &&
		typeof args.tier === 'number' &&
		Number.isInteger(args.tier) &&
		args.tier > 0 && args.tier <=5 &&

    args.hasOwnProperty("iterations") &&
		typeof args.iterations === 'number' &&
		Number.isInteger(args.iterations) &&
		args.iterations > 0 &&

    args.hasOwnProperty("limit") &&
		typeof args.limit === 'boolean'
		){
			return true
		}
	console.info('Invalid args for gathering')
	return false
}


function verifyCraftingArgs(args){
	if(
    args.hasOwnProperty("recipe") &&
		typeof args.recipe === 'string' &&


    args.hasOwnProperty("iterations") &&
		typeof args.iterations === 'number' &&
		Number.isInteger(args.iterations) &&
		args.iterations > 0 &&

    args.hasOwnProperty("limit") &&
		typeof args.limit === 'boolean' &&

    args.hasOwnProperty("ingredients") &&
    Array.isArray(args.ingredients) &&
    args.ingredients.length <= 10 &&
    args.ingredients.every(item => typeof item === 'string') &&

    args.hasOwnProperty("upgrades") &&
    Array.isArray(args.upgrades) &&
    args.upgrades.length <= 10 &&
    args.upgrades.every(item => typeof item === 'string')
		){
      // Remove duplicates from ingredients and upgrades arrays in place
      args.ingredients = [...new Set(args.ingredients)];
      args.upgrades = [...new Set(args.upgrades)];

  
      return true
    }
	console.info('Invalid args for crafting')
	return false
}

module.exports = {verify}