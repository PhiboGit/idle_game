const mongoose = require('mongoose')
const EventEmitter = require('events');

const ResourceSchema = require('./resource')
const {SkillsSchema} = require('./skills')

const {senderMediator} = require('../../routes/websocket/mediator')

// character has a name basic stats, race, resources, inventory, equipment, items, tools, level
const CharacterSchema = new mongoose.Schema(
	{
		characterName: {
			type: String,
			required: true,
			unique: true,
			index: true,
			},
		level: Number,
		exp: Number,
		currentAction: String,
    resource: ResourceSchema,
		skills: SkillsSchema,
	},
	{ collection: 'characters' }
)

const characterEmitter = new EventEmitter();


// Middleware

CharacterSchema.pre('findOneAndUpdate', function () {
	const updateFields = this.getUpdate();
	const conditions = this.getQuery();

	const characterName = conditions.characterName;
	
	update = {}
	for (const key in updateFields) {
		update[key] = []
		for (const property in updateFields[key]) {
			const value = updateFields[key][property]
			console.log(`Middleware hook: {key: ${key}, name: ${characterName}, field: ${property}, value: ${value}}`);
			update[key].push({field: property, value: value});
			
			if (property === 'exp'){
				characterEmitter.emit('exp', {character: characterName, exp: value});
			}

		}
	}
	senderMediator.publish('update_char', {character: characterName, msg: update})
});



const Character = mongoose.model('CharacterSchema', CharacterSchema)

Character.collection.createIndex({ characterName: 1 }, { unique: true }, (error) => {
	if (error) {
	  console.error('Error creating unique index:', error);
	} else {
	  console.log('Unique index created on characterName field');
	}
  });

module.exports = Character