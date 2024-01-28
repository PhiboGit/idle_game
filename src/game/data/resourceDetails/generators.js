function generateEquipmentObject(name, displayName, description="", slot, equipmentSkills= [], tiers = [1,2,3,4,5], rarityList = ["common", "uncommon", "rare", "epic", "legendary"]) {
  const itemObject = {};

  for (const tier of tiers) {
    for (const rarity of rarityList) {
      const key = `${name}T${tier}_${rarity}`;
      itemObject[key] = {
        "equipmentType": slot,
        "professions": equipmentSkills,
        "tier": tier,
        "rarity": rarity,
        "displayName": displayName,
        "description": description
      };
    }
  }

  return itemObject;
}


module.exports = { generateEquipmentObject };