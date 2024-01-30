const mongoose = require('mongoose')


const ItemOrderSchema = new mongoose.Schema(
	{
    sellerCharacter: {type: String},
    buyerCharacter: {type: String},
    
    price: {type: Number},
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },

    goldCollected: {type: Boolean, default: false},
    itemCollected: {type: Boolean, default: false},

    createDate: {type: Date, default: Date.now},
    expireDate: {type: Date},
    
    status: {type: String, default: 'error'}
	},
	{ collection: 'itemorders' }
)

const ItemOrder = mongoose.model('ItemOrder', ItemOrderSchema)

module.exports = ItemOrder