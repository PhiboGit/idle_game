const dataLoader = require('../utils/dataLoader')

const gatheringData = dataLoader.gatheringResourcesData

const woodcuttingData = gatheringData.woodcutting
const miningData = gatheringData.mining
const harvestingData = gatheringData.harvesting


class GatheringResourceForm {
  constructor(data){
    this.level = data.level
    this.time = data.time
    this.amount = data.amount
    this.exp = data.exp
    this.CharacterExp = data.expChar
  }
}

/**
 * Static data about gathering this resources.
 * It contains the level requirements, gathering time, exp etc.
 * 
 * @param {Number} tier 
 * @returns {GatheringResourceForm}
 */
function getWoodcuttingData(tier){
  // tiers is a array. tier1 is at 0, tier2 is at 1...
  return new GatheringResourceForm(woodcuttingData.tiers[tier-1])
}

/**
 * 
 * @param {Number} tier 
 * @returns {GatheringResourceForm}
 */
function getMiningData(tier){
  // tiers is a array. tier1 is at 0, tier2 is at 1...
  return new GatheringResourceForm(miningData.tiers[tier-1])
}

/**
 * 
 * @param {Number} tier 
 * @returns {GatheringResourceForm}
 */
function getHarvestingData(tier){
  // tiers is a array. tier1 is at 0, tier2 is at 1...
  return new GatheringResourceForm(harvestingData.tiers[tier-1])
}

module.exports = {getWoodcuttingData, getHarvestingData, getMiningData}