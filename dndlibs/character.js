// This library is to handle character creation, modification, and basic interaction

// This library uses the dice functions
const dice = require('./dice.js');

// This library needs access to my sqlHelpers
const sql = require('./sqlite3Helpers.js');

// There are six attribute stats: Str, Dex, Con, Wis, Int, Cha
const STATSNUMBER = 6;

// Initializes a new character into the database.
async function create_character(interaction) {

    // TODO: Check if the user exists in the users table. If not, add them
    let userId = interaction.user.id;
    let userRow = [];
    sql.execute("blarg");


    // TODO: If the userRow SELECT came back undefined
    if (!userRow) {
        // db.exec(`INSERT INTO Users(id) VALUES(?);`, userId);
    }
    // Check if the user already has an active character, if so tell them and quit
    if (userRow.active_character_id) {
        console.log(`${interaction.user.username} already has an active character!`);
        interaction.reply("You already have a character!");
        return false;
    }

    // TODO: Create a collector to ask questions and receive answers
    // Filter for messages from the same user
    const filter = m => m.author.id == userId;
    
    // Collector grabs messages from the channel it was started in, and it also
    // filters messages to be the same as the userId who is making this character.
    // The collector is active for 15 minutes.
    const collector = interaction.channel.createMessageCollector({filter, time: (60000 * 15)});

    // When the collector ends or times out:
    collector.on('end', collected => {
        console.log(`Collected: ${collected.size} items.`)
    });

    let characterName = "";
    // What name for the character?
    collector.on('collect', m => {
        characterName = m.content;
    });
    if (characterName == "") {
        interaction.reply({content: "Your character must have a name!", ephemeral: true});
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