const data = {
	gatheringType: 'String: woodcutting, mining',
	tier: 'Number/Integer: 1-5',
	limit: 'Boolean',
	iterations: 'Number/Integer: >0',
}

const gathering = [
	'woodcutting',
	'mining',
	'harvesting'
]

class WsGatheringForm{
	constructor(data){
		this.gatheringType = data.gatheringType
		this.tier = data.tier
		this.limit = data.limit
		this.iterations = data.iterations
	}
}

function getGatheringData(msg){
	if(
		msg && msg.data &&
		typeof msg.data.gatheringType === 'string' &&
		gathering.includes(msg.data.gatheringType) &&
		typeof msg.data.tier === 'number' &&
		Number.isInteger(msg.data.tier) &&
		msg.data.tier > 0 && msg.data.tier <=5 &&
		typeof msg.data.iterations === 'number' &&
		Number.isInteger(msg.data.iterations) &&
		msg.data.iterations > 0 &&
		typeof msg.data.limit === 'boolean'
		){
			return new WsGatheringForm(msg.data)
		}
	console.info('gathering data form invalid')
	return null
}

module.exports = {getGatheringData, WsGatheringForm, gatheringDataForm: data}