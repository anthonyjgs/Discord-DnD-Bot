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
        for (const subrace of race.subRaces) {
            const raceString = `${subrace.name} ${race.name}`;
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
    let bonuses = primaryRace.abilityScoreBonuses;
    if (subRace) {
        for (const bonus in subRace.abilityScoreBonuses) {
            bonuses[bonus] ? bonuses[bonus] += bonus : bonuses[bonus] = bonus;
        }
    }
    return bonuses;
}

// Classes
const classesPath = Path.resolve('dndlibs', '..', 'classes');
const classes = Utility.objArrayFromJSON(classesPath);

// Creating a character object
function characterObjectFromUserId(userId) {
    const db = new Database(dbFile, {verbose: console.log});
    const stmt =
        db.prepare('SELECT active_character_id FROM users WHERE id = ?');
    const activeCharacterId = stmt.get(userId).active_character_id;
    db.close();

    if (activeCharacterId) {
        return new Character(activeCharacterId);
    } else {
        // NO ACTIVE CHARACTER
        return undefined
    }
    
}

/**
 * The class for characters
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

    // TODO: Can make most of these into their own functions at some point
    getCharacterSheet() {
        const db = new Database(dbFile, {verbose: console.log});
        const id = this.id;
        // General Character Stats
        let stmt = db.prepare('SELECT * FROM characters WHERE id = ?');
        const characterRow = stmt.get(id);
        // Ability Scores
        stmt = db.prepare('SELECT * FROM abilityScores WHERE id = ?');
        const abilityRow = stmt.get(id);
        delete abilityRow.id;
        // Features
        stmt = db.prepare('SELECT displayName FROM features WHERE character_id = ?');
        const features = stmt.all(id).map(o => o.displayName);
        // Proficiencies
        stmt = db.prepare('SELECT displayName FROM proficiencies WHERE character_id = ?');
        const proficiencies = stmt.all(id).map(o => o.displayName);
        // Inventory
        stmt = db.prepare('SELECT displayName FROM inventory WHERE character_id = ?');
        const inventory = stmt.all(id).map(o => o.displayName);
        // Saving Throws
        stmt = db.prepare('SELECT savingThrow FROM savingThrows WHERE character_id = ?');
        const savingThrows = stmt.all(id).map(o => o.savingThrow);
        // Spell Slots
        stmt.prepare('SELECT * FROM spellSlots WHERE character_id = ?');
        const spellSlots = stmt.get(id);
        delete spellSlots.character_id;
        // Spells
        stmt.prepare('SELECT displayName FROM spells WHERE character_id = ?');
        const spells = stmt.all(id).map(o => o.displayName);

        // TODO: Consider a way to automate filling multiple properties at once
        const sheet = {
            ...characterRow,
            abilityScores: {...abilityRow},
            savingThrows: savingThrows,
            features: features,
            proficiencies: proficiencies,
            spellSlots: {...spellSlots},
            spells: spells
        }
        db.close();
        return sheet;
    }

    getFeatures(feature=null) {
        const featuresDir = Path.resolve('dndlibs', '..', 'FEPS', 'features');
        if (feature) {
            // Look for a specific feature object
        } else {
            // Return an array of all of them
        }
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
        return races.find(o => o.name == race);
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
    characterObjectFromUserId
}