module.exports = {
    name: "Cleric",
    hitDice: "1d8",
    startingHP: 8,
    proficiencies: [
        "Light Armor", "Medium Armor", "Shields",
        "Simple Weapons"
    ],
    savingThrows: ["wis", "cha"],
    freeSkills: 2,
    potentionalSkills: ["History", "Insight", "Medicine", "Persuasion", "Religion"],
    startingEquipment: {
        option1: ["Mace", "Warhammer"],
        option2: ["Scale Mail", "Leather Armor", "Chain Mail"],
        option3: [["Light Crossbow", "20_Crossbow Bolt"], "anySimpleWeapon"],
        option4: ["Priest's Pack", "Explorer's Pack"],
        given: ["Shield", "Holy Symbol"]
    },

    levels: {
        level1: {
            features: ["Spellcasting", "Divine Domain"],
            spellSlots: {"cantrips": 3, "spellLevel1": 2}
        },
        level2: {
            features: ["Channel Divinity1", "Divine Domain Feature"],
            spellSlots: {"spellLevel1": 3}
        },
        level3: {
            spellSlots: {"spellLevel1": 4, "spellLevel2": 2}
        },
        level4: {
            features: ["Ability Score Improvement"],
            spellSlots: {"cantrips": 4, "spellLevel2": 3}
        },
        level5: {
            features: ["destroyUndead1"],
            spellSlots: {"spellLevel3": 2}
        },
        level6: {
            features: ["channelDivinity2", "divineDomainFeature"],
            spellSlots: {"spellLevel3": 3}
        },
        level7: {
            spellSlots: {"spellLevel4": 1}
        },
        level8: {
            features: ["abilityScoreImprovement", "destroyUndead2", "divineDomainFeature"],
            spellSlots: {"spellLevel4": 2}
        },
        level9: {
            spellSlots: {"spellLevel4": 3, "spellLevel5": 1}
        },
        level10: {
            features: ["divineIntervention1"],
            spellSlots: { "cantrips": 5, "spellLevel5": 2}
        },
        level11: {
            features: ["destroyUndead3"],
            spellSlots: {"spellLevel6": 1}
        },
        level12: {
            features: ["abilityScoreImprovement"]
        },
        level13: {
            spellSlots: {"spellLevel7": 1}
        },
        level14: {
            features: ["destroyUndead4"]
        },
        level15: {
            spellSlots: {"spellLevel8": 1}
        },
        level16: {
            features: ["abilityScoreImprovement"]
        },
        level17: {
            features: ["destroyUndead5", "divineDomainFeature"],
            spellSlots: {"spellLevel9": 1}
        },
        level18: {
            features: ["channelDivinity3"],
            spellSlots: {"spellLevel5": 3}
        },
        level19: {
            features: ["abilityScoreImprovement"],
            spellSlots: {"spellLevel6": 2}
        },
        level20: {
            features: ["divineIntervention2"],
            spellSlots: {"spellLevel7": 2}
        }
    }
}