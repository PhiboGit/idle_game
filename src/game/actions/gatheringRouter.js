
const {woodcutting} = require('./woodcutting')
const {mining} = require('./mining')
const WsGatheringForm = require('../../routes/websocket/wsForms/wsGatheringForm')
const {senderMediator} = require('../../routes/websocket/mediator')

function gather(character, data){
    const form = WsGatheringForm.getGatheringData(data)
    if (!form) {
        senderMediator.publish('error', {character: character, msg: `Invalid attribute names or typeof for gather data`})
      return
    }
    if (form.gatheringType == "woodcutting"){
        woodcutting(character, form)
    } else if (form.gatheringType == "mining"){
        mining(character, form)
    } else if (form.gatheringType == "harvesting"){
        harvesting(character, form)
    }
    else{
        console.log("Unknown gathering type: " + data.gatheringType)
        senderMediator.publish('error', {character: character, msg: "check the values of data. Unknown gathering type"})
    }
}

module.exports = {gather}