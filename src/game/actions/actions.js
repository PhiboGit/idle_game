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
      msg.type && typeof msg.type === 'string' && msg.type === 'action' && 
      msg.actionType && typeof msg.actionType === 'string' &&
      msg.args)){
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
    args.tier &&
		typeof args.tier === 'number' &&
		Number.isInteger(args.tier) &&
		args.tier > 0 && args.tier <=5 &&

    args.iterations &&
		typeof args.iterations === 'number' &&
		Number.isInteger(args.iterations) &&
		args.iterations > 0 &&

    args.limit &&
		typeof args.limit === 'boolean'
		){
			return true
		}
	console.info('Invalid args for gathering')
	return false
}


function verifyCraftingArgs(args){
	if(
    args.recipe &&
		typeof args.recipe === 'string' &&


    args.iterations &&
		typeof args.iterations === 'number' &&
		Number.isInteger(args.iterations) &&
		args.iterations > 0 &&

    args.limit &&
		typeof args.limit === 'boolean'
		){
			return true
		}
	console.info('Invalid args for crafting')
	return false
}

module.exports = {verify}