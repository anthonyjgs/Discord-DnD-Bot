module.exports = {
    name: "Dragonborn",
    abilityScoreBonuses: {"strength": 2, "charisma": 1},
    speed: 30,
    features: ["Breath Weapon", "Damage Resistance"],
    languages: ["Common", "Draconic"],

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
                    `subrace damage types! ${ancestry}`);
        }
    },

    
}