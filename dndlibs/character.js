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

// Classes
const classesPath = Path.resolve('dndlibs', '..', 'classes');
const classes = Utility.objArrayFromJS(classesPath);

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

function parseFromEquipment(equipment){
    const itemArray = equipment.split('_');
    // If itemArray is only 1 element, then there is only one item
    if (itemArray.length == 1) return `${equipment}`;
    // If itemArray is 2 elements, then it is an item and its quantity
    else if (itemArray.length == 2){
        //
        return `${itemArray[0]} ${itemArray[1]}`;
    }
}

/**
 * Checks a string to see if it is the name of an equipment list, and returns
 * the items of the list as a strings array if so. If the string is not an
 * equipment list, then it returns the unmodified string in an array instead.
 * An equipment list starts with 'any'.
 * @param {String} s 
 * @returns {Array}
 */
function getEquipList(s){
    // Convert s to an array and checks if it starts with 'any'
    let sArray = s.split(' ');
    if (sArray[0].toLowerCase() != 'any') return [s];
    // Cut out 'any', the rest should be the names of tags
    sArray.splice(0, 1);
    // Use files from items folder
    const itemPath = Path.resolve(__dirname, '..', 'FEPS', 'items');
    // Get the object of every item, store in rArray
    let rArray = Utility.objArrayFromJS(itemPath);
    // Filter rArray repeatedly for each tag from sArray
    for (let tag of sArray) { 
        rArray = rArray.filter(o => o.tags.includes(tag));
    }
    // Return the names of the remaining items
    return rArray.map(o => o.name);
}

/**
 * Create a character object with the data from, name, race, and class
 * @param {Number} character_id the number id of the character
 * @param {String} name the name of the character
 * @param {String} characterRace the race of the character
 * @param {String} characterClass the class of the character
 * @returns {Character}
 */
 function initializeCharacter(
        name, characterRace, characterClass, abilityScores, db=null
        ) {

    if (!db || !db.open) return dbWrap(initializeCharacter(
        name, characterRace, characterClass, abilityScores
    ));

    // Create a character object
    const char = new Character(null, db);
    char.name = name;
    char.race = characterRace;
    char.charClass = characterClass.name;
    char.abilityScores = abilityScores;

    // Get references to the race and class objects
    const raceObj = char.getPrimaryRaceObj();
    const subRaceObj = char.getSubRaceObj();
    const classObj = char.getClassObject();
    const abilityMods = char.getAbilityModifiers();

    // Set hp, hitdice, speed, proficiency bonus, level, experience
    char.maxHP = (classObj.startingHP + abilityMods.constitution);
    char.currentHP = char.maxHP;
    
    // Hit Dice
    [char.hitDiceCount, char.hitDiceSides] = classObj.hitDice.split('d').map(
        s => Number(s)
    );

    // If the subRaceObj exists, check if has speed property, if so, use that
    if (subRaceObj && subRaceObj.speed) char.speed = subRaceObj.speed;
    // Otherwise use primary race speed
    else char.speed = raceObj.speed;

    char.proficiencyBonus = 2;
    char.experience = 0;
    char.level = 1;
    
    // Set features
    let raceFeatures = raceObj.features;
    raceFeatures = raceFeatures ? [...raceFeatures] : [];
    let subRaceFeatures = subRaceObj.features;
    subRaceFeatures = subRaceFeatures ? [...subRaceFeatures] : [];
    let classFeatures = classObj.levels.level1.features;
    classFeatures = classFeatures ? [...classFeatures] : [];
    char.features = [...raceFeatures, ...subRaceFeatures, ...classFeatures]

    // Set proficiencies
    let raceProfs = raceObj.proficiencies;
    raceProfs = raceProfs ? [...raceProfs] : [];
    let subRaceProfs = subRaceObj.proficiencies;
    subRaceProfs = subRaceProfs ? [...subRaceProfs] : [];
    let classProfs = classObj.proficiencies;
    classProfs = classProfs ? [...classProfs] : [];
    char.proficiencies = [...raceProfs, ...subRaceProfs, ...classProfs]

    // Set savingThrows
    char.savingThrows = [...classObj.savingThrows];
    // Prep spellSlots for insertion
    char.spellSlots = classObj.levels.level1.spellSlots;
    // Set languages
    let raceLangs = raceObj.languages;
    raceLangs = raceLangs ? [...raceLangs] : [];
    let subRaceLangs = subRaceObj.languages;
    subRaceLangs = subRaceLangs ? [...subRaceLangs] : [];
    char.languages = [...raceLangs, ...subRaceLangs]

    // Add GIVEN equipment (parse number of equipment also)
    char.inventory = [];
    for (let equipment of classObj.startingEquipment.given) {
        const equipmentArray = equipment.split('_');
        let equipmentCount = 1;
        if (equipmentArray.length == 2) {
            equipmentCount = equipmentArray[0];
            equipment = equipmentArray[1];
        }
        // Add a new element for every piece of equipment, even duplicates
        for (let i = 0; i < equipmentCount; i++){
            char.inventory.push(equipment);
        }
    }

    return char;
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
        return null
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
    constructor(characterId=null, db=null) {
        // Use the database wrapper if needed
        if (!db || !db.open) return dbWrap.call(this, this, characterId);

        if (characterId) this.id = characterId;
        else return;

        // cR is Character Row
        let stmt = db.prepare('SELECT * FROM characters WHERE id = ?');
        let cR = stmt.get(this.id);

        // Fillout properties
        this.name = cR.name;
        this.charClass = cR.class;
        this.race = cR.race;
        this.maxHP = cR.maxHP;
        this.currentHP = cR.currentHP;
        this.tempHP = cR.tempHP;
        this.hitDiceCount = cR.hitDiceCount;
        this.hitDiceSides = cR.hitDiceSides;
        this.deathSaveSuccesses = cR.deathSaveSuccesses;
        this.deathSaveFails = cR.deathSaveFails;
        this.armorClass = cR.armorClass;
        this.initiative = cR.initiative;
        this.speed = cR.speed;
        this.proficiencyBonus = cR.proficiencyBonus;
        this.money = cR.money;
        this.experience = cR.experience;
        this.level = cR.level;

        // Ability Scores
        stmt = db.prepare('SELECT * FROM abilityScores WHERE id = ?');
        this.abilityScores = stmt.get(this.id);
        if (this.abilityScores) delete this.abilityScores.id;
        // Features
        stmt = db.prepare('SELECT * FROM features WHERE character_id = ?');
        this.features = stmt.all(this.id).map(o => o.displayName);
        // Proficiencies
        stmt = db.prepare('SELECT * FROM proficiencies WHERE character_id = ?');
        this.proficiencies = stmt.all(this.id).map(o => o.displayName);
        // Spells
        stmt = db.prepare('SELECT * FROM spells WHERE character_id = ?');
        this.spells = stmt.all(this.id).map(o => o.displayName);
        // Spell Slots
        stmt = db.prepare('SELECT * FROM spellSlots WHERE character_id = ?');
        this.spellSlots = stmt.get(this.id);
        delete this.spellSlots.character_id;
        // Inventory
        stmt = db.prepare('SELECT * FROM inventory WHERE character_id = ?');
        this.inventory = stmt.all(this.id).map(o => o.displayName);
        // Saving throws
        stmt = db.prepare('SELECT * FROM savingThrows WHERE character_id = ?');
        this.savingThrows = stmt.all(this.id).savingThrow;
        // Languages
        stmt = db.prepare('SELECT * FROM languages WHERE character_id = ?');
        this.languages = stmt.all(this.id).language;
    }

    /**
     * Add items to the characters inventory, parsing for quantity
     * @param {Array} items the items to add, an array of the item names
     */
    addItems(items) {
        if (!this.inventory) this.inventory = [];
        for (let item of items) {
            const itemArray = item.split('_');
            let itemCount = 1;
            if (itemArray)
        }
    }

    // TODO:
    applyDamage(amount, type) {

    }

    // Commit every property from the object to it's relevant value in db
    commitToDB(db = null) {
        // Wraps this function in between opening and closing the DB if needed
        if (!db || !db.open) return dbWrap.call(this, this.commitToDB);

        // Characters Table
        let stmt = ('UPDATE characters SET '+
            'name = ?, '+
            'race = ?, '+
            'class = ?, '+
            'maxHP = ?, '+
            'currentHP = ?, '+
            'tempHP = ?, '+
            'hitDiceCount = ?, '+
            'hitDiceSides = ?, '+
            'deathSaveSuccesses = ?, '+
            'deathSaveFails = ?, '+
            'armorClass = ?, '+
            'initiative = ?, '+
            'speed = ?, '+
            'proficiencyBonus = ?, '+
            'money = ?, '+
            'experience = ?, '+
            'level = ? '+
            'WHERE id = ?');
        db.prepare(stmt).run(
            this.name,
            this.race,
            this.charClass,
            this.maxHP,
            this.currentHP,
            this.tempHP,
            this.hitDiceCount,
            this.hitDiceSides,
            this.deathSaveSuccesses,
            this.deathSaveFails,
            this.armorClass,
            this.initiative,
            this.speed,
            this.proficiencyBonus,
            this.money,
            this.experience,
            this.level,
            this.id
        );
        // Ability Scores Table
        stmt = db.prepare('SELECT * FROM abilityScores WHERE id = ?');
        const scoresExist = stmt.get(this.id);
        if (!scoresExist) {
            stmt = db.prepare('INSERT INTO abilityScores(id) VALUES(?)');
            stmt.run(this.id);
        }
        stmt = ('UPDATE abilityScores SET '+
            'strength = ?, '+
            'dexterity = ?, '+
            'constitution = ?, '+
            'intelligence = ?, '+
            'wisdom = ?, '+
            'charisma = ? '+
            'WHERE id = ?'
        );
        db.prepare(stmt).run(
            this.abilityScores.strength,
            this.abilityScores.dexterity,
            this.abilityScores.constitution,
            this.abilityScores.intelligence,
            this.abilityScores.wisdom,
            this.abilityScores.charisma,
            this.id
        );
        // Saving Throws Table
        // First, wipe the entries
        stmt = ('DELETE FROM savingThrows WHERE character_id = ?');
        db.prepare(stmt).run(this.id);
        // Then add each saving throw from the object's property
        for (const save of this.savingThrows) {
            stmt = ('INSERT INTO savingThrows(character_id, savingThrow) '+
                'VALUES(?, ?)');
            db.prepare(stmt).run(this.id, save);
        }

        // Spell Slots Table
        stmt = ('UPDATE spellSlots SET ? = ? WHERE id = ?'
        );
        for (const slot in this.spellSlots) {
            db.prepare(stmt).run(slot, this.spellSlots[slot], this.id);
        }

        // Spells Table
        // Wipe, then replace from spells property
        if (this.spells) {
            stmt = ('DELETE FROM spells WHERE character_id = ?');
            db.prepare(stmt).run(this.id);
            stmt = ('INSERT INTO spells(character_id, displayName) VALUES(?, ?)');
            for (const spell of this.spells) {
                db.prepare(stmt).run(this.id, spell);
            }
        }

        // Features Table
        stmt = ('DELETE FROM features WHERE character_id = ?');
        db.prepare(stmt).run(this.id);
        stmt = ('INSERT INTO features(character_id, displayName) VALUES(?, ?)');
        for (const feature of this.features) {
            db.prepare(stmt).run(this.id, feature);
        }
        // Proficiencies Table
        stmt = ('DELETE FROM proficiencies WHERE character_id = ?');
        db.prepare(stmt).run(this.id);
        stmt = ('INSERT INTO proficiencies(character_id, displayName) VALUES(?, ?)');
        for (const proficiency of this.proficiencies) {
            db.prepare(stmt).run(this.id, proficiency);
        }
        // Inventory Table
        stmt = ('DELETE FROM inventory WHERE character_id = ?');
        db.prepare(stmt).run(this.id);
        stmt = ('INSERT INTO inventory(character_id, displayName) VALUES(?, ?)');
        for (const item of this.inventory) {
            db.prepare(stmt).run(this.id, item);
        }
        // Languages Table
        stmt = ('DELETE FROM languages WHERE character_id = ?');
        db.prepare(stmt).run(this.id);
        stmt = ('INSERT INTO languages(character_id, language) VALUES(?, ?)');
        for (const language of this.languages) {
            db.prepare(stmt).run(this.id, language);
        }
    }

    /**
     * Returns an object with the character's ability modifiers
     */
     getAbilityModifiers() {
        let scores = this.getAbilityScores();
        let mods = {};
        for (let key in scores) {
            mods[key] = Math.floor((scores[key] - 10)/2);
        }
        return mods
    }

    /**
     * Returns an object with the character's ability scores
     */
    getAbilityScores() {
        return this.abilityScores;
    }

    getClassObject(className=null) {
        if (!className){
            className = this.charClass;
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

    getFeatureObjects(feature=null) {
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
     * @returns {Number} the character's level
     */
    getLevel() {
        return this.level;
    }

    /**
     * @returns {String} The primary race string
     */
    getPrimaryRace() {
        let race = this.getRace();
        race = race.split(' ');
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
        return this.race;
    }

    getSpells() {

    }

    getSpellSlots() {
        let slots = this.spellSlots;
        slots ? delete slots.character_id : slots = undefined;
        return slots;
    }

    /**
     * Returns the subrace as a string
     * @param {String} raceName 
     * @returns {String}
     */
    getSubRace(raceName=null) {
        const race = raceName ? raceName.split(' ') : this.getRace().split(' ');
        if (race.length == 1) return undefined;
        else if (race.length == 2) return race[0];
    }

    getSubRaceObj() {
        const raceName = this.getRace();
        const primaryRace = this.getPrimaryRaceObj();
        const subRaceName = this.getSubRace(raceName);
        const subRaceObj = primaryRace.subRaces.find(o => o.name == subRaceName);
        return subRaceObj;
    }

    setHealth(n) {

    }
}

// Probably unnecessary to use like this, future me can fix if needed
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
    initializeCharacter,
    parseFromEquipment,
    getEquipList
}