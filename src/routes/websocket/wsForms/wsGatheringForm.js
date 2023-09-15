const miningWS= {
	"type": "action",
	"actionType" : "mining",
	"args": {
      "tier": 1,
      "limit": true,
      "iterations": 20
    }
  }


const smeltingWS= {
	"type": "action",
	"actionType" : "smelting",
	"args": {
      "recipe": "ingotT1", // the smeltingRecipe
      "limit": true,
      "iterations": 20
    }
  }

const cancelWS={
	"type": "cancel",
	"index": -1 // index < 0 is the current action, otherwise the queue index
}




const formWS = {
	"type": "action",
	"actionType" : "[smelting, woodworking, ...]",
	"args": {
      "recipe": "ingotT1", // the smeltingRecipe
      "limit": true,
      "iterations": 20
    }
}

module.exports = {}