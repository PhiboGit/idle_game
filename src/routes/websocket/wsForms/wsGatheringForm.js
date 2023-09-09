const data = {
    gatheringType: 'String: woodcutting, mining',
    tier: 'Number: 1-6',
    limit: 'Boolean',
    iterations: 'Number',
}

class WsGatheringForm{
    constructor(data){
        this.gatheringType = data.gatheringType
        this.tier = data.tier
        this.limit = data.limit
        this.iterations = data.iterations
    }
}

function getGatheringData(msg){
    console.log("getGatheringData: ", msg)
    if(
        msg && msg.data &&
        typeof msg.data.gatheringType === 'string' &&
        typeof msg.data.tier === 'number' &&
        typeof msg.data.iterations === 'number' &&
        typeof msg.data.limit === 'boolean'
        ){
            return new WsGatheringForm(msg.data)
        }
    console.info('gathering data form invalid')
    return null
}

module.exports = {getGatheringData, WsGatheringForm, gatheringDataForm: data}