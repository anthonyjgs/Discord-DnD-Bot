/* eslint-disable no-unused-vars */
// Collection of functions and objects for characters

const Path = require('node:path');
const Utility = require('../miscUtility');
const Database = require('better-sqlite3');
const { features } = require('node:process');
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

/**
 * Populate the relevent tables with the data from a character's race and class
 * @param {Number} character_id the number id of the character
 * @param {String} characterRace the race of the character
 * @param {String} characterClass the class of the character
 */
 function initializeRaceAndClass(character_id, characterRace, characterClass) {
    // Get references to the race and class objects
    const char = new Character(character_id);
    const raceObj = char.getPrimaryRaceObj();
    const subRaceObj = raceObj.subRaces[char.getSubRace()];
    const classObj = char.getClassObject();

    const abilityMods = char.getAbilityModifiers();

    // Set hp, hitdice, speed, proficiency bonus, level, experience
    const maxHP = (classObj.startingHP + abilityMods.con);
    const currentHP = maxHP;
    
    const hitDice = classObj.hitDice.split('d');
    const hitDiceCount = hitDice[0];
    const hitDiceSides = hitDice[1];

    const speed = subRaceObj.speed || raceObj.speed;
    const proficiencyBonus = 2;
    const experience = 0;
    const level = 1;
    // Set features
    const features = [
        ...raceObj.features,
        ...subRaceObj.features,
        ...classObj.levels.level1.features
    ]

    // Set proficiencies
    const proficiencies = [
        ...raceObj.proficiencies,
        ...subRaceObj.proficiencies,
        ...classObj.proficiencies
    ]
    // Set savingThrows
    const savingThrows = classObj.savingThrows;
    // Set spellSlots
    const spellSlots = classObj.levels.level1.spellSlots;
    // Set languages
    const languages = [
        ...raceObj.languages,
        ...subRaceObj.languages
    ]
    // TODO: INSERT EVERYTHING INTO THE DATABASE
    const db = new Database(dbFile, {verbose: console.log});

    // Update for HP, hit dice, speed, proficiency bonus, experience, and level
    let stmt = db.prepare(
        'UPDATE characters('+
        'maxHP, currentHP, hitDiceCount, hitDiceSides,' +
        'speed, proficiencyBonus, experience, level' +
        ') VALUES(?,?,?,?, ?,?,?,?)' +
        'WHERE id = ?')
    stmt.run(maxHP, currentHP, hitDiceCount, hitDiceSides,
        speed, proficiencyBonus, experience, level, character_id);
    
    // Insert features
    for (const feature in features) {
        db.prepare('INSERT INTO features(character_id, displayName) ' +
            'VALUES(?, ?)')
            .run(character_id, feature);
    }

    // Insert proficiencies
    for (const proficiency in proficiencies) {
        db.prepare('INSERT INTO proficiencies(character_id, displayName) ' +
            'VALUES(?, ?)')
            .run(character_id, proficiency);
    }
    // Insert given equipment (parse number of equipment also)
    for (let equipment in classObj.startingEquipment.given) {
        const equipmentArray = equipment.split('_');
        let equipmentCount = 1;
        if (equipmentArray == 2) {
            equipmentCount = equipmentArray[0];
            equipment = equipmentArray[1];
        }
        // Add a new row for every piece of equipment, even duplicates
        for (let i = 0; i < equipmentCount; i++){
            db.prepare('INSERT INTO inventory(character_id, displayName) ' +
                'VALUES(?, ?)')
                .run(character_id, equipment);
        }
    }
    // Insert saving throws
    for (const savingThrow in savingThrows) {
        db.prepare('INSERT INTO savingThrows(character_id, savingThrow) ' +
            'VALUES(?, ?)')
            .run(character_id, savingThrow);
    }
    // Insert languages
    for (const language in languages) {
        db.prepare('INSERT INTO languages(character_id, language) ' +
            'VALUES(?, ?)')
            .run(character_id, language);
    }

    db.close();
}

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

    /**
     * Add FEPS to the relevant table in the database
     * @param {String} table Which table? proficiencies, features, spells, or inventory?
     * @param {Array} FEPS The elements to add to the relevant table
     * @param {Database.Database} db Pass in the database if you don't want function to open and close it
     */
    addFEPS(table, FEPS, db=null) {
        // Determine if this function needs to open database (and therefore close it too)
        let closeDB = false;
        if (!db || !db.open()) {
            db = new Database(dbFile, {verbose: console.log});
            closeDB = true;
        }

        // Ensure table is a valid option
        table = table.toLowerCase();
        const options = ['proficiencies', 'features', 'spells', 'inventory'];
        if (!options.includes(table)) {
            throw console.error('Invalid type passed into addFEPS()!');
        }

        // Add the feps
        for (const fep of FEPS) {
            const stmt = db.prepare(
                `INSERT INTO ${table}(character_id, displayName) ` + 
                `VALUES(?, ?)`);
            stmt.run(this.id, fep);
        }

        if (closeDB) db.close();
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
            scores[key] = Math.floor((scores[key] - 10)/2);
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

    getClassObject(className=null) {
        if (!className){
            const db = new Database(dbFile, {verbose: console.log});
            let stmt = db.prepare('SELECT class FROM characters WHERE id = ?');
            className = stmt.get(this.id).class;
            db.close();
        }

        return classes.find(o => o.name == className);
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
    characterObjectFromUserId,
    initializeRaceAndClass
}