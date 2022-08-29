module.exports = {
    name: "Dragonborn",
    abilityScoreBonuses: {"str": 2, "cha": 1},
    speed: 30,
    features: ["breathWeapon", "damageResistance"],
    languages: ["common", "draconic"],

    subRaces: [
        {name: "Black"},
        {name: "Blue"},
        {name: "Brass"},
        {name: "Bronze"},
        {name: "Copper"},
        {name: "Gold"},
        {name: "Green"},
        {name: "Red"},
        {name: "Silver"},
        {name: "White"}
    ],

    /**
     * Gets the damageType associated with a dragonborn subrace
     * @param {String} ancestry dragonborn subrace string
     * @returns {String}
     */
    damageType(ancestry) {
        switch (ancestry) {
            case ('black' || 'copper'):
                return 'acid';
            case ('blue' || 'bronze'):
                return 'lightning';
            case ('brass' || 'gold' || 'red'):
                return 'fire';
            case 'green':
                return 'poison';
            case ('silver' || 'white'):
                return 'cold';
            default:
                throw console.error(`Dragonborn subrace missing from `+
                    `breathweapon damagetype! ${ancestry}`);
        }
    },

    
}