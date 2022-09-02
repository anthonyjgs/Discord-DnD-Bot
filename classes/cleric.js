const Character = require('../dndlibs/character');
const Utility = require('../miscUtility');

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
            spellSlots: {"cantrips": 3, "slot1": 2}
        },
        level2: {
            features: ["Channel Divinity_1", "Divine Domain Feature"],
            spellSlots: {"slot1": 3}
        },
        level3: {
            spellSlots: {"slot1": 4, "slot2": 2}
        },
        level4: {
            features: ["Ability Score Improvement"],
            spellSlots: {"cantrips": 4, "slot2": 3}
        },
        level5: {
            features: ["Destroy Undead_1"],
            spellSlots: {"slot3": 2}
        },
        level6: {
            features: ["Channel Divinity_2", "Divine Domain Feature"],
            spellSlots: {"slot3": 3}
        },
        level7: {
            spellSlots: {"slot4": 1}
        },
        level8: {
            features: ["Ability Score Improvement", "Destroy Undead_2", "Divine Domain Feature"],
            spellSlots: {"slot4": 2}
        },
        level9: {
            spellSlots: {"slot4": 3, "slot5": 1}
        },
        level10: {
            features: ["Divine Intervention_1"],
            spellSlots: { "cantrips": 5, "slot5": 2}
        },
        level11: {
            features: ["Destroy Undead_3"],
            spellSlots: {"slot6": 1}
        },
        level12: {
            features: ["Ability Score Improvement"]
        },
        level13: {
            spellSlots: {"slot7": 1}
        },
        level14: {
            features: ["Destroy Undead_4"]
        },
        level15: {
            spellSlots: {"slot8": 1}
        },
        level16: {
            features: ["Ability Score Improvement"]
        },
        level17: {
            features: ["Destroy Undead_5", "Divine Domain Feature"],
            spellSlots: {"slot9": 1}
        },
        level18: {
            features: ["Channel Divinity_3"],
            spellSlots: {"slot5": 3}
        },
        level19: {
            features: ["Ability Score Improvement"],
            spellSlots: {"slot6": 2}
        },
        level20: {
            features: ["Divine Intervention_2"],
            spellSlots: {"slot7": 2}
        }
    },

    /**
     * 
     * @param {Character.Character} characterObj 
     */
    getLearnableSpells(characterObj, db=null) {
        const spellsPath = '../FEPS/spells/';
        const spellSlots = characterObj.getSpellSlots(db);
        
        // Convert the slots to numbers
        let slotLevels = Object.keys(spellSlots);
        slotLevels = slotLevels.map(k => {
            if (k.toLowerCase() == 'cantrips') return 0;
            else {
                // Cut out the letters, and return as a number
                k = k.replace('slot', '');
                return Math.floor(k);
            }
        })
        const spellLevel = Math.max(slotLevels);

        // Get the names of learnable spells
        const learnableSpells = Utility.objArrayFromJS(spellsPath).map(o => {
            if (o.slot <= spellLevel && o.classes.includes(this.name))
                return o.name;
        });
        return learnableSpells;
    },

    /**
     * Returns the number of spells that a cleric can choose to know
     * @param {Number} character_id The character's id number
     * @param {*} db The database to use, otherwise this function will handle both opening and closing the db
     * @returns 
     */
    getNumKnownSpells(character_id, db=null) {
        // Num of known cleric spells is determined by cleric level and wisdom mod
        const character = new Character.Character(character_id);
        const wisdomMod = character.getAbilityModifiers(db).wisdom;
        const level = character.getLevel(db);

        return wisdomMod + level;
    }
}