// This library is to handle character creation, modification, and basic interaction

// This library uses the dice functions
const dice = require('./dice.js');

const Database = require('better-sqlite3');

// There are six attribute stats: Str, Dex, Con, Wis, Int, Cha
const STATSNUMBER = 6;

// Initializes a new character into the database.
async function create_character(interaction) {
    let channel = interaction.channel;

    // Open the dnd.db and set it to console.log every statement
    const db = new Database('dnd.db', {verbose: console.log} )
    // TODO: Check if the user exists in the users table. If not, add them
    let userId = interaction.user.id;
    const stmt = db.prepare('SELECT * FROM Users WHERE id = ?');
    userRow = stmt.get(userId);
    console.log(`userRow is: ${userRow}`);


    // Naming the character
    interaction.reply("What would you like to name your new character?");
    const filter = m => {
        return m.author.id == userId;
    }
    let nameCollection = await channel.awaitMessages({filter, max: 1, time: 15000 * 60});
    // name is the content of the only item in the collection with whitespace trimmed
    let name = nameCollection.first().content.trim();

    console.log(`Name is: ${name}`);
    
    if (name == "") {
        interaction.followUp({content: "Your character must have a name!", ephemeral: true});
        return false;
    }

    // TODO: What race for the character?

    // TODO: What class for the character?

    // TODO: For each stat, prompt the user to select which roll to apply
    let statRolls = rollForStats();
    console.log(statRolls);
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