const activeActions = {}

function hasActiveAction(character) {
    // check for active action
    if (!character in activeActions ||
        activeActions[character] === undefined){
            return false
        }
    return true
}

function cancelAction(character) {
    const action = activeActions[character]
    if (!action){
        console.log("No active action")
        return false
    }
    clearTimeout(action)
    activeActions[character] = undefined
    return true
}

/**
 * Sets the active action. Also cancels running actions.
 * 
 * @param {String} character 
 * @param {*} action A timeout object
 */
function setAction(character, action) {
    if(hasActiveAction(character)){
        cancelAction(character)
    }
    activeActions[character] = action
    console.log(character, ": New action started")
}

module.exports = {hasActiveAction, cancelAction, setAction}