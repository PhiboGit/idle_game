class CharacterForm_Incremental{
  constructor(){
    {
      this.exp = 0;
      this.resource = {
          wood: {
            tiers:{
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            }
          },
          ore: {
            tiers:{
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            }
          },
          hide: {
            tiers:{
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            }
          },
          fiber: {
            tiers:{
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            }
          },
      };
      this.skills = {
          woodcutting: {
              exp: 0,
          },
          mining: {
              exp: 0,
          },
          harvesting: {
              exp: 0,
          },
      };
    }
  }
}

/**
 * Converts the form to a json object used for update in a mongoose update function.
 * You will need to put this object in a '$inc' property for the update (update['$inc'] = this)
 * 
 * @param {CharacterForm_Incremental} form 
 */
function getUpdate_IncObject(form){
  // Prepare the update object for $inc
  const updateData = {}
  updateData['exp'] = form.exp

  // Process resource tiers
  for (const resourceName in form.resource) {
    for (const tier in form.resource[resourceName].tiers) {
      const fieldValue = form.resource[resourceName].tiers[tier]
      if (fieldValue !== 0) {
        const fieldPath = `resource.${resourceName}.tiers.${tier}`
        updateData[fieldPath] = fieldValue
      }
    }
  }

  // Process skill experience
  for (const skillName in form.skills) {
    const expValue = form.skills[skillName].exp
    if (expValue !== 0) {
      const fieldPath = `skills.${skillName}.exp`
      updateData[fieldPath] = expValue
    }
  }
  return updateData
}

/**
 * A form the fill out and then give the Service to increment the values
 * 
 * @returns {CharacterForm_Incremental}
 */
function getCharacterForm_Increment(){
  return new CharacterForm_Incremental()
}

module.exports = {getCharacterForm_Increment, getUpdate_IncObject, CharacterForm_Incremental}