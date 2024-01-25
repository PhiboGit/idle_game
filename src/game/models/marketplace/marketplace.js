const mongoose = require('mongoose')


const MarketplaceSchema = new mongoose.Schema(
	{
    resource: {type: String, unique: true},

    orderBookSelling: [{
      _id: false,
      price: {type: Number},
      totalUnits: {type: Number},

      orders: [{
        _id: false,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        units: {type: Number},
      }],
    }],

    orderBookBuying: [{
      _id: false,
      price: {type: Number},
      totalUnits: {type: Number},

      orders: [{
        _id: false,
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        units: {type: Number},
      }],
    }],

	},
	{ collection: 'marketplace' }
)

const Marketplace = mongoose.model('MarketplaceSchema', MarketplaceSchema)

module.exports = Marketplace
