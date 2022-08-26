module.exports = {
    Name: "Dragonborn",
    AbilityScoreBonuses: {"str": 2, "cha": 1},
    Speed: 30,
    Features: ["breathWeapon", "damageResistance"],
    Languages: ["common", "draconic"],

    SubRaces: [
        {Name: "Black"},
        {Name: "Blue"},
        {Name: "Brass"},
        {Name: "Bronze"},
        {Name: "Copper"},
        {Name: "Gold"},
        {Name: "Green"},
        {Name: "Red"},
        {Name: "Silver"},
        {Name: "White"}
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