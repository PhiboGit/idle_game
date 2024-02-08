const { gatheringResourcesData, regionData} = require('../utils/dataLoader')
const { weightedChoice } = require('../utils/randomDice')


function getNextNode(region){
  let weights  = []
  const events = []
  for (const node of regionData[region].terrain){
    events.push(node)
    weights.push(node.weight)
  }

  const result = weightedChoice(events, 1, weights)[0]

  console.log("getNextNode for region:", result)

  const re ={
    node: result.node,
    iterations: result.max
  }

  return re
}


function getNextAction(character, regionActionObject){
  console.log("regionManager: ", regionActionObject)
  const region = regionActionObject.args.region
  const regionInfo = regionData[region]
  console.log("regionManager: ", regionInfo)
  const selectedNodes = regionActionObject.args.nodes
  const nextAction = getNextNode(region)

  if(!regionActionObject.args.traveled || !selectedNodes.includes(nextAction.node)){
    console.log("regionManager: send you traveling. Either you started to find a node, or you did not find the selected node!")
    regionActionObject.args["traveled"] = true
    const travelAction = {
      counter: 0,
      type: "action",
      actionType: "searching", 
      task: "traveling",
      limit: true,
      iterations:1,
      args: {
        travelTime: regionInfo.travelTime,
      }
    }
    return travelAction
  }
  console.log("regionManager: you found a selected node...")
  regionActionObject.args["traveled"] = false

  const nodeInfo = findProfessionAndTier(nextAction.node)
  const actionObject = {
    counter: 0,
    type: "action",
    actionType: nodeInfo.profession, 
    task: "gathering",
    limit: true,
    iterations:nextAction.iterations,
    args: {
      "tier": nodeInfo.tier,
    }
  }
  console.log("regionManager: your new action is gathering this node!", actionObject)
  return actionObject
}

/**
 * 
 * @param {String} node 
 */
function findProfessionAndTier(node) {
  const data = gatheringResourcesData;
  for (const profession of Object.keys(data)) {
      const tiers = data[profession].tiers;
      for (let i = 0; i < tiers.length; i++) {
          if (tiers[i].lootTable === node) {
              return { profession: profession, tier: i + 1 };
          }
      }
  }
  return null; // Return null if node is not found
}

module.exports = {getNextAction}