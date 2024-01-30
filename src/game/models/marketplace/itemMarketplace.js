const mongoose = require('mongoose')


const ItemMarketplaceSchema = new mongoose.Schema(
	{
    itemName: {type: String, unique: true},

    orderBook: [
     {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ItemOrder',
      },
    ],
	},
	{ collection: 'itemmarketplace' }
)

const ItemMarketplace = mongoose.model('ItemMarketplaceSchema', ItemMarketplaceSchema)

module.exports = ItemMarketplace
