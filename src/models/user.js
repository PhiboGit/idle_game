const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		characterName: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		password: {
			type: String,
			required: true
		},
		email: String,
        tokens: [],
		createdAt: Date,
		updatedAt: Date,
	},
	{ collection: 'users' }
)

const User = mongoose.model('UserSchema', UserSchema)
User.collection.createIndex({ username: 1, characterName: 1 }, { unique: true }, (error) => {
	if (error) {
	  console.error('Error creating unique index:', error);
	} else {
	  console.log('Unique index created on username,characterName field');
	}
  });


module.exports = User