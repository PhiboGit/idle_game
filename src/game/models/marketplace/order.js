const mongoose = require('mongoose')


const OrderSchema = new mongoose.Schema(
	{
    orderType: {type: String, default: 'order'},
    character: {type: String},
    resource: {type: String},
    price: {type: Number},
    units: {type: Number},
    unitsInit: {type: Number},

    unitsToCollect: {type: Number, default: 0},
    goldToCollect: {type: Number, default: 0},

    createDate: {type: Date, default: Date.now},
    expireDate: {type: Date},
    
    status: {type: String, default: 'error'}
	},
	{ collection: 'orders' }
)

const Order = mongoose.model('Order', OrderSchema)

module.exports = Order