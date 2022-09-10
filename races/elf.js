module.exports = {
    name: "Elf",
    abilityScoreBonuses: {"dexterity": 2},
    speed: 30,
    features: ["darkVision", "feyAncestry", "trance"],
    proficiences: ["perception"],
    languages: ["common", "elvish"],

    subRaces: [
        {
            name: "Dark",
            abilityScoreBonuses: {"charisma": 1},
            features: ["superiorDarkvision", "sunlightSensitivity", "drowMagic"],
            proficiences: ["rapiers", "shortswords", "handCrossbows"]
        },
        {
            name: "High",
            abilityScoreBonuses: {"intelligence": 1},
            features: ["cantrip", "extraLanguage"],
            proficiences: ["longswords", "shortswords", "shortbow", "longbow"]
        },
        {
            name: "Wood",
            abilityScoreBonuses: {"wisdom": 1},
            features: ["fleetOfFoot", "maskOfTheWild"],
            proficiences: ["longswords", "shortswords", "shortbow", "longbow"]
        }
    ]
}