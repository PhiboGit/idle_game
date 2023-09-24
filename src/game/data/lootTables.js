const {rollDice, rollRange, adjustWeights, weightedChoice} = require('../utils/randomDice')
const {lootTables} = require('../utils/dataLoader')

function rollTable(table, luck){

  roll = rollDice(table.maxRoll) + (table.luck ? luck : 0)
  console.log('rollTable: ', roll)

  const re = []
  for (const loot of table.loot){
    if (roll >= loot.roll){
      re.push({"item": loot.item, "amount": rollRange(loot.min, loot.max)})
    }
  } 
  return re
}


function weightTable(table, size, luck){
  
  
  let weights  = []
  const events = []
  for (const loot of table.loot){
    events.push(loot)
    weights.push(loot.weight)
  }
  
  //check if it is limited
  const limitByLuck = table["limitByLuck"]
  const startLimit = table["startLimit"]
  const endLimit = table["endLimit"]
  if (limitByLuck && startLimit && endLimit) {
    let index = 0
    for (let i = 0; i < limitByLuck.length; i++) {
      if (luck >= limitByLuck[i]){
        index = i
      } else {
        break
      }
    }

    weights = adjustWeights(weights, startLimit[index], endLimit[index])
    console.log(weights)
  }
  const results = weightedChoice(events, size, weights)

  const re = []
  for (const x of results) {
    if (x.item == null) continue
    re.push({"item": x.item, "amount": rollRange(x.min, x.max)})
  }
  return re
}


/**
 * 
 * @param {String} tableName the string of the table in lootTables.json
 * @param {Number} size how many times to open the table
 * @param {Number} luck player luck
 * @returns {}  [{ item: "itemName", amount: Number },...]
 */
function parseLootTable(tableName, size= 1, luck = 0) {
  const results = [];

  // Recursive function to parse loot tables
  function parseTable(table, size, luck) {
    if (table.type === "roll") {
      const rolls = rollTable(table, luck);
      for (const roll of rolls) {
        if (roll.item.startsWith("[LTID]")) {
          const subTable = lootTables[roll.item.substring(6)];
          if (subTable) {
            parseTable(subTable, roll.amount, luck);
          }
        } else {
          results.push({ item: roll.item, amount: roll.amount });
        }
      }
    } else if (table.type === "weights") {
      const rolls = weightTable(table, size, luck);
      for (const roll of rolls) {
        if (roll.item.startsWith("[LTID]")) {
          const subTable = lootTables[roll.item.substring(6)];
          if (subTable) {
            parseTable(subTable, roll.amount, luck);
          }
        } else {
          results.push({ item: roll.item, amount: roll.amount });
        }
      }
    }
  }
  const table = lootTables[tableName]
  if (!table) {
    throw new Error(`Couldn't find table: ${tableName}`)
  }
  parseTable(table, size, luck);
  return results;
}

//console.log(parseLootTable("Stick", 1, 1500))

module.exports = {parseLootTable}