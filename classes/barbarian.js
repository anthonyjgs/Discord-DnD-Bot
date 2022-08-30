module.exports = {
    name: "Barbarian",
    hitDice: "1d12",
    startingHP: 12,

    proficiencies: [
        "Light Armor", "Medium Armor", "Shields",
        "Simple Weapons", "Martial Weapons"
    ],

    savingThrows: ["str", "con"],
    freeSkills: 2,
    potentionalSkills: ["Animal Handling", "Athletics", "Intimidation", "Nature", "Perception", "Survival"],

    startingEquipment: {
        option1: ["Greataxe", "anyMartialMeleeWeapon"],
        option2: ["2_Handaxe", "anySimpleWeapon"],
        given: ["Explorer's Pack", "4_Javelin"]
    },

    levels: {
        level1: {
            features: ["Rage", "Unarmored Defense"]
        },
        level2: {
            features: ["Reckless Attack", "Danger Sense"]
        },
        level3: {
            features: ["Primal Path"]
        },
        level4: {
            features: ["Ability Score Improvement"]
        },
        level5: {
            features: ["Extra Attack", "Fast Movement"]
        },
        level6: {
            features: ["Path Feature"]
        },
        level7: {
            features: ["Feral Instinct"]
        },
        level8: {
            features: ["Ability Score Improvement"]
        },
        level9: {
            features: ["Brutal Critical_1"]
        },
        level10: {
            features: ["Path Feature"]
        },
        level11: {
            features: ["Relentless Rage"]
        },
        level12: {
            features: ["Ability Score Improvement"]
        },
        level13: {
            features: ["Brutal Critical_2"]
        },
        level14: {
            features: ["Path Feature"]
        },
        level15: {
            features: ["Persistent Rage"]
        },
        level16: {
            features: ["Ability Score Improvement"]
        },
        level17: {
            features: ["Brutal Critical3"]
        },
        level18: {
            features: ["Indomitable Might"]
        },
        level19: {
            features: ["Ability Score Improvement"]
        },
        level20: {
            features: ["Primal Champion"]
        }
    }
}