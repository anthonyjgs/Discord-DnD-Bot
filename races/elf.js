module.exports = {
    Name: "Elf",
    AbilityScoreBonuses: {"dex": 2},
    Speed: 30,
    Features: ["darkVision", "feyAncestry", "trance"],
    Proficiencies: ["perception"],
    Languages: ["common", "elvish"],

    SubRaces: [
        {
            Name: "Dark",
            AbilityScoreBonuses: {"cha": 1},
            Features: ["superiorDarkvision", "sunlightSensitivity", "drowMagic"],
            Proficiencies: ["rapiers", "shortswords", "handCrossbows"]
        },
        {
            Name: "High",
            AbilityScoreBonuses: {"int": 1},
            Features: ["cantrip", "extraLanguage"],
            Proficiencies: ["longswords", "shortswords", "shortbow", "longbow"]
        },
        {
            Name: "Wood",
            AbilityScoreBonuses: {"wis": 1},
            Features: ["fleetOfFoot", "maskOfTheWild"],
            Proficiencies: ["longswords", "shortswords", "shortbow", "longbow"]
        }
    ]
}