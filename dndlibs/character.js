// This library is to handle character creation, modification, and basic interaction
const dice = require('./dice.js');
const sql = require('sqlite3').verbose();

// This library needs access to the database
const db = sql.Database('../dnd.db');

sql.Database



// There are six attribute stats: Str, Dex, Con, Wis, Int, Cha
const STATSNUMBER = 6;

// Initializes a new character into the database.
async function create_character(interaction) {
    // TODO: Check if the user exists in the users table. If not, add them
    userId = interaction.user.id;

    // TODO: Check if the user already has an active character
    
    // TODO: What name for the character?

    // TODO: What race for the character?

    // TODO: What class for the character?

    // TODO: For each stat, prompt the user to select which roll to apply
    let statRolls = rollForStats();
}

// Generates an array of 6 ints, each is the total of 4d6 after droping the lowest roll
function rollForStats() {
    let results = [];

    for (let i = 0; i < STATSNUMBER; i++) {
        // Get 4d6 array, sort it in desc order, pop last element, push the sum of remaining elements
        let currentResult = dice.rollDice(4, 6);
        currentResult.sort().reverse().pop();
        currentResult = currentResult.reduce((a, b) => a + b, 0);
        results.push(currentResult);
    }

    return results;
}

module.exports = {
    create_character
}