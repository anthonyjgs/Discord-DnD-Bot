/* eslint-disable no-unused-vars */
// Collection of functions and objects for characters

const Path = require('node:path');
const Utility = require('../miscUtility');
const Database = require('better-sqlite3');
const dbFile = 'dnd.db';

// Races
const racesPath = Path.resolve('dndlibs', '..', 'races');
const races = Utility.objArrayFromJS(racesPath);

/**
 * Returns an array of the full name for every subrace
 * (ex: [..., 'High Elf', 'Wood Elf', 'Lightfoot Halfling', ...])
 * @returns {Array}
 */
function getAllSubRaceNames() {
    let subraceArray = [];
    for (const race of races) {
        for (const subrace of race.SubRaces) {
            const raceString = `${subrace.Name} ${race.Name}`;
            subraceArray.push(raceString);
        }
    }
    return subraceArray;
}
/**
 * Takes primaryRace and subRace, returns the attribute bonuses
 * @param {Object} primaryRace 
 * @param {Object} subRace 
 * @returns {Object}
 */
function getAbilityBonuses(primaryRace, subRace=null) {
    let bonuses = primaryRace.AbilityScoreBonuses;
    if (subRace) {
        for (const bonus in subRace.AbilityScoreBonuses) {
            bonuses[bonus] ? bonuses[bonus] += bonus : bonuses[bonus] = bonus;
        }
    }
    return bonuses
}

// Classes
const classesPath = Path.resolve('dndlibs', '..', 'classes');
const classes = Utility.objArrayFromJSON(classesPath);

/**
 * @param characterId The id to make a Character object from.
 */
class Character {
    constructor(characterId) {
        this.id = characterId
    }
    // TODO:
    applyDamage(amount, type) {

    }

    /**
     * Returns an object with the character's ability modifiers
     */
     getAbilityModifiers() {
        let scores = this.getAbilityScores();
        for (let key in scores) {
            scores[key] = Math.floor(scores[key] - 10);
        }
        return scores
    }

    /**
     * Returns an object with the character's ability scores
     */
    getAbilityScores() {
        const db = new Database(dbFile, {verbose: console.log});

        // Should return an object like {strength: 12, dexterity: 14, ...}
        const scores = db.prepare('SELECT strength, dexterity, constitution,',
            'intelligence, wisdom, charisma FROM abilityScores WHERE id = ?')
            .get(this.id);

        db.close();
        return scores;
    }

    getCharacterSheet() {

    }

    getFeatures(feature = null) {

    }

    getHealth() {

    }

    getInventory() {

    }

    /**
     * @returns {String} The primary race string
     */
    getPrimaryRace() {
        const race = this.getRace().split(' ');
        if (race.length == 1) return race[0];
        else if (race.length == 2) return race[1];
    }

    /**
     * Get a reference to the primary race object file
     * @returns {Object} The race object from file
     */
    getPrimaryRaceObj() {
        const race = this.getPrimaryRace();
        return races.find(o => o.Name == race);
    }

    getProficiencies() {

    }

    /**
     * Returns the character's full race as a string
     * @returns {String}
     */
    getRace() {
        const db = new Database(dbFile, {verbose: console.log});
        const stmt = db.prepare('SELECT race FROM characters WHERE id = ?');
        const race = stmt.get(this.id);
        db.close();
        return race[race];
    }

    getSpells() {

    }

    getSpellSlots() {

    }

    getSubRace() {
        const race = this.getRace().split(' ');
        if (race.length == 1) return undefined;
        else if (race.length == 2) return race[0];
    }

    setHealth(n) {

    }
}

module.exports = {
    races,
    classes,
    Character,
    getAllSubRaceNames,
    getAbilityBonuses,
}