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
const classes = Utility.objArrayFromJS(classesPath);

/**
 * Populate the relevent tables with the data from a character's race and class
 * @param {Number} character_id the number id of the character
 * @param {String} characterRace the race of the character
 * @param {String} characterClass the class of the character
 */
 function initializeRaceAndClass(character_id, characterRace, characterClass, db=null) {
    if (!db || !db.open) return dbWrap(initializeRaceAndClass(
        character_id,
        characterRace,
        characterClass
    ));

    // Get references to the race and class objects
    const char = new Character(character_id);
    const raceObj = char.getPrimaryRaceObj(db);
    const subRaceObj = char.getSubRaceObj(db);
    const classObj = char.getClassObject(null, db);

    const abilityMods = char.getAbilityModifiers(db);

    // Set hp, hitdice, speed, proficiency bonus, level, experience
    const maxHP = (classObj.startingHP + abilityMods.constitution);
    const currentHP = maxHP;
    
    // TODO: Make this initialize as numbers
    const [hitDiceCount, hitDiceSides] = classObj.hitDice.split('d');

    let speed;
    // If the subRaceObj exists, check if has speed property, if so, use that
    if (subRaceObj && subRaceObj.speed) speed = subRaceObj.speed;
    // Otherwise use primary race speed
    else speed = raceObj.speed;

    const proficiencyBonus = 2;
    const experience = 0;
    const level = 1;
    
    // Set features
    let raceFeatures = raceObj.features;
    raceFeatures = raceFeatures ? [...raceFeatures] : [];
    let subRaceFeatures = subRaceObj.features;
    subRaceFeatures = subRaceFeatures ? [...subRaceFeatures] : [];
    let classFeatures = classObj.levels.level1.features;
    classFeatures = classFeatures ? [...classFeatures] : [];
    const features = [...raceFeatures, ...subRaceFeatures, ...classFeatures]

    // Set proficiencies
    let raceProfs = raceObj.proficiencies;
    raceProfs = raceProfs ? [...raceProfs] : [];
    let subRaceProfs = subRaceObj.proficiencies;
    subRaceProfs = subRaceProfs ? [...subRaceProfs] : [];
    let classProfs = classObj.proficiencies;
    classProfs = classProfs ? [...classProfs] : [];
    const proficiencies = [...raceProfs, ...subRaceProfs, ...classProfs]

    // Set savingThrows
    const savingThrows = [...classObj.savingThrows];
    // Prep spellSlots for insertion
    let spellSlots = classObj.levels.level1.spellSlots;
    spellSlots = spellSlots ? new SpellSlots({...spellSlots}) : undefined;
    // Set languages
    let raceLangs = raceObj.languages;
    raceLangs = raceLangs ? [...raceLangs] : [];
    let subRaceLangs = subRaceObj.languages;
    subRaceLangs = subRaceLangs ? [...subRaceLangs] : [];
    const languages = [...raceLangs, ...subRaceLangs]

    // INSERT EVERYTHING INTO THE DATABASE
    // Update for HP, hit dice, speed, proficiency bonus, experience, and level
    let stmt = db.prepare('UPDATE characters SET '+
        'maxHP=?, currentHP=?, hitDiceCount=?, hitDiceSides=?, ' +
        'speed=?, proficiencyBonus=?, experience=?, level=? ' +
        'WHERE id = ?');
    stmt.run(maxHP, currentHP, hitDiceCount, hitDiceSides,
        speed, proficiencyBonus, experience, level, character_id);
    
    // Insert features
    for (const feature of features) {
        db.prepare('INSERT INTO features(character_id, displayName) ' +
            'VALUES(?, ?)')
            .run(character_id, feature);
    }

    // Insert proficiencies
    for (const proficiency of proficiencies) {
        db.prepare('INSERT INTO proficiencies(character_id, displayName) ' +
            'VALUES(?, ?)')
            .run(character_id, proficiency);
    }
    // Insert GIVEN equipment (parse number of equipment also)
    for (let equipment of classObj.startingEquipment.given) {
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
    for (const savingThrow of savingThrows) {
        db.prepare('INSERT INTO savingThrows(character_id, savingThrow) ' +
            'VALUES(?, ?)')
            .run(character_id, savingThrow);
    }
    // Insert spellSlots?
    if (spellSlots) {
        db.prepare('INSERT INTO spellSlots(cantrips, slot1, slot2, slot3, '+
            'slot4, slot5, slot6, slot7, slot8, slot9) VALUES(?,?,?,?,?,?,?,?,?,?)')
            .run(
                spellSlots.cantrips,
                spellSlots.slot1,
                spellSlots.slot2,
                spellSlots.slot3,
                spellSlots.slot4,
                spellSlots.slot5,
                spellSlots.slot6,
                spellSlots.slot7,
                spellSlots.slot8,
                spellSlots.slot9
            );
    }
    // Insert languages
    for (const language of languages) {
        db.prepare('INSERT INTO languages(character_id, language) ' +
            'VALUES(?, ?)')
            .run(character_id, language);
    }
}

/**
 * Get the active character of a user
 * @param {Number} userId The user to get the character from
 * @param {Database.Database} db Pass in the database if it's open 
 * @returns 
 */
function characterObjectFromUserId(userId, db=null) {
    // If no database passed in, use wrapper to handle opening and closing
    if (!db || !db.open) return dbWrap(characterObjectFromUserId, userId);
    // If db passed in, do not handle database opening or closing at all
    const stmt =
        db.prepare('SELECT active_character_id FROM users WHERE id = ?');
    const activeCharacterId = stmt.get(userId).active_character_id;

    if (activeCharacterId) {
        return new Character(activeCharacterId);
    } else {
        // NO ACTIVE CHARACTER
        return undefined
    }
    
}

/**
 * Checks for open database, and handles opening and closing if necessary
 * @param {function} originalFunction The function to wrap
 * @param {Database.Database} db The database to check
 * @returns {*} The function called with db passed into it
 */
function dbWrap(originalFunction, ...args) {
    // Make a connection to the database.
    // (This also works if the db exists, but it was closed)
    const db = new Database(dbFile, {verbose: console.log});
    // If given a specific funtion, use that, otherwise use the 
    const data = originalFunction.call(this, ...args, db);
    db.close();
    return data;
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
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.addFEPS, table, FEPS);
        // If db passed in, do not handle database opening or closing at all

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
    }


    // TODO:
    applyDamage(amount, type) {

    }



    /**
     * Returns an object with the character's ability modifiers
     */
     getAbilityModifiers(db=null) {
        let scores = this.getAbilityScores(db);
        for (let key in scores) {
            scores[key] = Math.floor((scores[key] - 10)/2);
        }
        return scores
    }

    /**
     * Returns an object with the character's ability scores
     */
    getAbilityScores(db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getAbilityScores);
        // If db passed in, do not handle database opening or closing at all

        // Should return an object like {strength: 12, dexterity: 14, ...}
        const stmtString = 'SELECT strength, dexterity, constitution, ' +
            'intelligence, wisdom, charisma FROM abilityScores WHERE id = ?';
        const scores = db.prepare(stmtString).get(this.id);
        return scores;
    }

    getClassObject(className=null, db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getClassObject, className);
        // If db passed in, do not handle database opening or closing at all
        if (!className){
            let stmt = db.prepare('SELECT class FROM characters WHERE id = ?');
            let classRow = stmt.get(this.id);
            className = classRow.class;
        }
        return classes.find(o => o.name == className);
    }

    // TODO: Can make most of these into their own functions at some point
    getCharacterSheet(db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getCharacterSheet);
        // If db passed in, do not handle database opening or closing at all

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
     * Get's the character's level
     * @param {Database.Database} db 
     */
    getLevel(db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getLevel);
        // If db passed in, do not handle database opening or closing at all
        return db.prepare('SELECT level FROM characters WHERE id = ?')
                .get(this.id).level;
    }

    /**
     * @returns {String} The primary race string
     */
    getPrimaryRace(db=null) {
        let race = this.getRace(db);
        race = race.split(' ');
        if (race.length == 1) return race[0];
        else if (race.length == 2) return race[1];
    }

    /**
     * Get a reference to the primary race object file
     * @returns {Object} The race object from file
     */
    getPrimaryRaceObj(db=null) {
        const race = this.getPrimaryRace(db);
        return races.find(o => o.name == race);
    }

    getProficiencies() {

    }

    /**
     * Returns the character's full race as a string
     * @returns {String}
     */
    getRace(db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getRace);
        // If db passed in, do not handle database opening or closing at all
        const stmt = db.prepare('SELECT race FROM characters WHERE id = ?');
        const race = stmt.get(this.id);
        return race.race;
    }

    getSpells() {

    }

    getSpellSlots(db=null) {
        // If no database passed in, use wrapper to handle opening and closing
        if (!db || !db.open) return dbWrap.call(this, this.getRace);
        // If db passed in, do not handle database opening or closing at all

        const stmt = db.prepare('SELECT * FROM spellSlots WHERE character_id = ?');
        let slots = stmt.get(this.id);
        slots ? delete slots.character_id : slots = undefined;
        return slots;
    }

    /**
     * Returns the subrace as a string
     * @param {String} raceName 
     * @param {Database.Database} db 
     * @returns {String}
     */
    getSubRace(raceName=null, db=null) {
        const race = raceName ? raceName.split(' ') : this.getRace(db).split(' ');
        if (race.length == 1) return undefined;
        else if (race.length == 2) return race[0];
    }

    getSubRaceObj(db=null) {
        const raceName = this.getRace(db);
        const primaryRace = this.getPrimaryRaceObj(db);
        const subRaceName = this.getSubRace(raceName, db);
        const subRaceObj = primaryRace.subRaces.find(o => o.name == subRaceName);
        return subRaceObj;
    }

    setHealth(n) {

    }
}

class SpellSlots {
    constructor({
        cantrips=this.cantrips || 0,
        slot1=this.slot1 || 0, 
        slot2=this.slot2 || 0,
        slot3=this.slot3 || 0,
        slot4=this.slot4 || 0,
        slot5=this.slot5 || 0,
        slot6=this.slot6 || 0,
        slot7=this.slot7 || 0,
        slot8=this.slot8 || 0,
        slot9=this.slot9 || 0
    }) {
        this.cantrips = cantrips;
        this.slot1 = slot1;
        this.slot2 = slot2;
        this.slot3 = slot3;
        this.slot4 = slot4;
        this.slot5 = slot5;
        this.slot6 = slot6;
        this.slot7 = slot7;
        this.slot8 = slot8;
        this.slot9 = slot9;
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