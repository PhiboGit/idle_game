const {rollDice, rollRange, adjustWeights, weightedChoice} = require('../utils/randomDice')
const {lootTables} = require('../utils/dataLoader')

/**
 * This is an AND table. 
 * you get each entry that is within the range of the rolled random number
 * 
 * @param {*} table 
 * @param {*} luck player luck
 * @returns [{"item": x.item, "amount": rollRange(x.min, x.max)}]
 */
function rollTable(table, luck){

  roll = rollDice(table.maxRoll) + (table.luck ? luck : 0)
  console.log('rollTable: you rolled a: ', roll, table.maxRoll + (table.luck ? luck : 0))

  const re = []
  for (const loot of table.loot){
    console.log('rollTable: you need a: ', loot.roll)
    if (roll >= loot.roll){
      re.push({"item": loot.item, "amount": rollRange(loot.min, loot.max)})
    }
  } 
  return re
}

/**
 * If size is 1 this is an OR table.
 * 
 * @param {*} table
 * @param {*} size How many times to open this table. Returns number of size items
 * @param {*} luck the players luck
 * @returns [{"item": x.item, "amount": rollRange(x.min, x.max)}]
 */
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
      // check which limits to use based on player luck
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
  // loot is either another table or the loot to collect
  function parseTable(table, size, luck) {
    // two types of loot tables
    // TYPE: roll. AND
    if (table.type === "roll") {
      // open the table and get the loot
      const rolls = rollTable(table, luck);
      for (const roll of rolls) {
        // if it is another table, start recursion
        if (roll.item.startsWith("[LTID]")) {
          const subTable = lootTables[roll.item.substring(6)];
          if (subTable) {
            parseTable(subTable, roll.amount, luck);
          }
          // if not a table, just add the loot
        } else {
          results.push({ item: roll.item, amount: roll.amount });
        }
      }
      // TYPE: weights. OR
    } else if (table.type === "weights") {
      // open the table and get the loot
      const rolls = weightTable(table, size, luck);
      for (const roll of rolls) {
        // if it is another table, start recursion
        if (roll.item.startsWith("[LTID]")) {
          const subTable = lootTables[roll.item.substring(6)];
          if (subTable) {
            parseTable(subTable, roll.amount, luck);
          }
          // if not a table, just add the loot
        } else {
          results.push({ item: roll.item, amount: roll.amount });
        }
      }
    }
  }

  // table is in the defined lootTable json
  const table = lootTables[tableName]
  if (!table) {
    throw new Error(`Couldn't find table: ${tableName}`)
  }

  // start the recursive function
  parseTable(table, size, luck);
  return results;
}

//console.log(parseLootTable("Stick", 1, 1500))

module.exports = {parseLootTable}