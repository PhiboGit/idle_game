class WsGatheringForm{
    constructor(data){
        this.gatheringType = data.gatheringType
        this.tier = data.tier
        this.limit = data.limit
        this.iterations = data.iterations
    }
}

function getGatheringData(data){
    if(
        data &&
        typeof data.gatheringType === 'string' &&
        typeof data.tier === 'number' &&
        typeof data.iterations === 'number' &&
        typeof data.limit === 'boolean'
        ){
            return new WsGatheringForm(data)
        }
    console.info('gathering data form invalid')
    return null
}

module.exports = {getGatheringData, WsGatheringForm}