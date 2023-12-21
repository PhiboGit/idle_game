function generateItemObject(name, tiers) {
  const pickaxeObject = {};

  for (let tier = 1; tier <= tiers; tier++) {
    for (const rarity of ["common", "uncommon", "rare", "epic", "legendary"]) {
      const key = `${name}T${tier}_${rarity}`;
      pickaxeObject[key] = { type: Number, default: 0 };
    }
  }

  return pickaxeObject;
}


module.exports = { generateItemObject };