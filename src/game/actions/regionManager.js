const { gatheringResourcesData, regionData} = require('../utils/dataLoader')
const { weightedChoice } = require('../utils/randomDice')


function getNextNode(region, selectedNodes){
  let weights  = []
  const events = []
  for (const node of regionData[region].terrain){
    // can only get a node that was selected
    if(!selectedNodes.includes(node.node)) continue
    events.push(node)
    weights.push(node.weight)
  }
  console.log("getNextNode: ", weights, events)
  const result = weightedChoice(events, 1, weights)[0]

  console.log("getNextNode for region:", result)

  const re ={
    node: result.node,
    iterations: result.max
  }

  return re
}

function getTravelTime(region, selectedNodes) {
  const totalWeight = regionData[region].totalWeight 
  const travelCost = regionData[region].travelCost 
  const selectedWeight = regionData[region].terrain
    .filter(entry => selectedNodes.includes(entry.node)) 
    .reduce((sum, entry) => sum + entry.weight, 0); 

  const notCovered = totalWeight - selectedWeight
  
  const totalTravelTime = travelCost * notCovered

  return totalTravelTime
}


function getNextAction(character, regionActionObject){
  const region = regionActionObject.args.region
  console.log("regionManager: selected region:", region)
  const selectedNodes = regionActionObject.args.nodes.map((item) => item.node)
  console.log("regionManager: selectedNodes:", selectedNodes)
  const nextAction = getNextNode(region, selectedNodes)
  
  const travelTime = getTravelTime(region, selectedNodes)

  if(!regionActionObject.info.traveled){
    console.log("regionManager: send you traveling. You just started moving or finished a node!")
    
    regionActionObject.info.traveled = true
    regionActionObject.info.timeSpentTraveling += travelTime
    regionActionObject.info.travelCount += 1
    const travelAction = {
      region_action: true,
      counter: 0,
      type: "action",
      actionType: "searching", 
      task: "traveling",
      limit: true,
      iterations:1,
      args: {
        travelTime: travelTime,
      }
    }
    return travelAction
  }
  const nodeInfo = findProfessionAndTier(nextAction.node)
  console.log("regionManager: you found a selected node...")
  regionActionObject.info.traveled = false
  regionActionObject.info.lastNode = nextAction.node
  regionActionObject.args.nodes[selectedNodes.indexOf(nextAction.node)].iterations -= nextAction.iterations
  regionActionObject.args.nodes[selectedNodes.indexOf(nextAction.node)].counter += nextAction.iterations

  const done = regionActionObject.args.nodes.every((item) => item.iterations <= 0)
  if (regionActionObject.args.limit && done) {
    console.log("regionManager: conditions are met. The action will end." )
    regionActionObject.iterations = 0
  }

  const actionObject = {
    region_action: true,
    counter: 0,
    type: "action",
    actionType: nodeInfo.profession, 
    task: "gathering",
    limit: true,
    iterations:nextAction.iterations,
    args: {
      tier: nodeInfo.tier,
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