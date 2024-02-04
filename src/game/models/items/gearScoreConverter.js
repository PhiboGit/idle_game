const { gearScoreData } = require('../../utils/dataLoader')


/**
 * 
 * @param {String} skillName the profession
 * @param {*} gearScores gearScores object: gearScores: {"bonusType": value,...}
 */
function getSkillSheetForGearScore(skillName, item) {
  const gearScores = item.properties.gearScores ?? {}
  console.log("gearScoreConverter: ", gearScores)
  const skillSheet = {
    luck: 0,
    speed: 0,
    yieldMax: 0,
    exp: 0,

    con: 0,
    int: 0,
    dex: 0,
    str: 0,
    foc: 0
  };

  const gearScoreLookup = gearScoreData.gearScoreMap
  const maxGearScorePerAttribute = gearScoreData.maxGearScorePerAttribute

  for (const [key, score] of Object.entries(gearScores)){
    let bonusType = key

    // check if key is a skill specific bonus. "speed_woodcutting"
    if(key.includes('_') && key.split('_')[1] == skillName){
      bonusType = key.split('_')[0]
    }

    // set the skillSheet value based on the gearScore for this bonusType
    if(Object.keys(skillSheet).includes(bonusType) &&
       Object.keys(gearScoreLookup).includes(bonusType)){
        const valueMax = gearScoreLookup[bonusType]
        const value = (score / maxGearScorePerAttribute) * valueMax
        skillSheet[bonusType] = value
      }
  }
  console.log("gearScoreConverter: ", skillSheet)
  return skillSheet
}

module.exports = { getSkillSheetForGearScore };