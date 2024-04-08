const fs = require('fs');
const Ajv = require('ajv');
const path = require('path');

const region_filepath = path.join(__dirname, '../data/regions.json');
const gatheringResources_filepath = path.join(__dirname, '../data/gatheringResources.json');
const gatheringEXP_filepath = path.join(__dirname, '../data/EXP.json')
const recipes_filepath = path.join(__dirname, '../data/recipes.json')
const lootTables_filepath = path.join(__dirname, '../data/lootTables.json')
const craftingMaterials_filepath = path.join(__dirname, '../data/resourceDetails/craftingMaterials.json')
const charms_filepath = path.join(__dirname, '../data/resourceDetails/charms.json')
const gatheredResources_filepath = path.join(__dirname, '../data/resourceDetails/gatheredResources.json')
const refinedResources_filepath = path.join(__dirname, '../data/resourceDetails/refinedResources.json')
const enchanting_filepath = path.join(__dirname, '../data/enchanting.json')
const craftingTable_filepath = path.join(__dirname, '../data/craftingTable.json')
const vendor_filepath = path.join(__dirname, '../data/vendor.json')
const gearScore_filepath = path.join(__dirname, '../data/gearScore.json')

const regionData = loadJSONData(region_filepath);
const gatheringEXPData = loadJSONData(gatheringEXP_filepath);
const gatheringResourcesData = loadJSONData(gatheringResources_filepath);
const lootTables = loadJSONData(lootTables_filepath)

const craftingMaterials = loadJSONData(craftingMaterials_filepath)
const charms = loadJSONData(charms_filepath)
const gatheredResources = loadJSONData(gatheredResources_filepath)
const refinedResources = loadJSONData(refinedResources_filepath)


const enchantingProfession = loadJSONData(enchanting_filepath)
const craftingTable = loadJSONData(craftingTable_filepath)
const vendorData = loadJSONData(vendor_filepath)
const gearScoreData = loadJSONData(gearScore_filepath)

const recipesData = loadJSONData(recipes_filepath);

function loadJSONData(filePath) {
    try {
        const jsonString = fs.readFileSync(filePath, 'utf8');
        cachedData = JSON.parse(jsonString);
        console.log('loaded JSON successfully: ', filePath);
        return cachedData;
    } catch (error) {
        console.error('Error loading JSON data:', error);
        return null;
    }
}


// Define the JSON schema
const gatheringEXPschema = {
    type: 'object',
    patternProperties: {
        '^[0-9]+$': {
            type: 'object',
            properties: {
                Exp: { type: 'integer' },
                'Exp (total)': { type: 'integer' },
                'Character Exp': { type: 'integer' },
                Luck: { type: 'integer' },
                'Gathering Speed Bonus': { type: 'number' },
            },
        },
    },
}

const ajv = new Ajv();

const validate = ajv.compile(gatheringEXPschema);
const isValid = validate(gatheringEXPData);

if (isValid) {
    console.log('JSON data is valid according to the schema.');
} else {
    console.log('JSON data is not valid according to the schema:', validate.errors);
}

module.exports = {charms,gearScoreData, gatheredResources, refinedResources, regionData,vendorData, recipesData, gatheringEXPData, gatheringResourcesData, lootTables, craftingMaterials, enchantingProfession, craftingTable};
