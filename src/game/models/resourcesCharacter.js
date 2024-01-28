// marketplace or contract for refinements
const { resourcesInfo } = require('../data/resourceDetails/resourcesInfo')


const resourcesCharacter = () => {
  const res = {}
  Object.keys(resourcesInfo).forEach((key) =>{
    res[key] = {type: Number, default: 0}
  })
  return res
}

const resources = { ...resourcesCharacter()}

module.exports = {resources}