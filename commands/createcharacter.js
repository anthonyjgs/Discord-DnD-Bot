// Create a character!

// Imports SlashCommandBuilder from discord.js
// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, BaseInteraction } = require('discord.js');
const Database = require('better-sqlite3');
const Dice = require('../dndlibs/dice');

/**
 * Checks ability scores and, if valid, returns an object with each ability score allocated via properties
 * @param {Array} statsMsgArray The msg content to check and use for allocating stats
 * @param {Array} statRolls The roll values to use for stat allocation, in order from highest to lowest
 */
function allocateAbilityScores(statsMsgArray, statRolls) {
    let scores = {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0
    };
    // Make a copy of statRolls so the original is not modified
    let statRollsCopy = statRolls.map(x => x);
    let statsMsg = statsMsgArray.map(s => s);
    console.log(`statsMsg in allocate initialized as: ${JSON.stringify(statsMsg)}`);
    console.log(`statRollsCopy initialized as: ${JSON.stringify(statRollsCopy)}`);

    // Sort statRollsCopy so highest is at end, makes it easy to use pop() later
    statRollsCopy = statRollsCopy.sort();
    let receivedStats = [];
    for (let i = 0; i < statsMsg.length; i++) {
        let stat = statsMsg[i];
        stat.trim();
        console.log(`allocate received ${stat}`);
        if (receivedStats.includes(stat)) {
            interaction.channel.send(`Cannot assign duplicate stats: ${stat}`);
            console.log('Cannot assign duplicate stats');
            return false;
        }
        for (let ability in scores) {
            if (stat.includes(ability)) {
                // Assign the stat values based on the ability score
                scores[ability] = statRollsCopy.pop();
                break;
            }
        }
    }
    return scores;
}

/**
 * Returns an array of the ability score bonuses based on race
 * @param {String} race 
 * @returns {Array}
 */
function raceAbilityScoreBonuses(race) {
    let bonuses = {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0
    }
    // Prep race string for easy classification
    race = race.toLowerCase();
    const raceArray = race.split(' ');
    let primaryRace;
    let subRace;
    if (raceArray.length == 2) {
        primaryRace = raceArray[1];
        subRace = raceArray[0];
    } else {
        primaryRace = raceArray[0];
    }

    switch (primaryRace) {
        case 'dragonborn':
            // Ability scores based on whole race
            bonuses.str += 2;
            bonuses.cha += 1;
            break;

        case 'dwarf':
            // Ability scores based on whole race
            bonuses.con += 2;
            // Ability scores based on subrace
            switch (subRace) {
                case 'hill':
                    bonuses.wis += 1;
                    break;
                case 'mountain':
                    bonuses.str += 2;
                    break;
                default:
                    throw console.error(`Invalid subrace: ${subRace}`);
            }
            break;

        case 'elf':
            // Ability scores based on whole race
            bonuses.dex += 2;
            // TODO: Ability scores based on subrace
            switch (subRace) {
                case 'dark':
                    break;
                case 'high':
                    break;
                case 'wood':
                    break
                default:
                    throw console.error(`Invalid subrace: ${subRace}`);
            }
            break;

        case 'gnome':
            // TODO: Ability scores based on whole race

            // TODO: Ability scores based on subrace
            switch (subRace) {
                default:
                    throw console.error(`Invalid subrace: ${subRace}`);
            }
            break;

        case 'half-elf':
            // TODO: Ability scores based on whole race

            break;

        case 'half-orc':
            // TODO: Ability scores based on whole race

            break;

        case 'halfling':
            // TODO: Ability scores based on whole race

            // TODO: Ability scores based on subrace
            switch (subRace) {
                default:
                    throw console.error(`Invalid subrace: ${subRace}`);
            }
            break;

        case 'human':
            // TODO: Ability scores based on whole race

            break;

        case 'tiefling':
            // TODO: Ability scores based on whole race

            break;

        default:
            throw console.error(`Race not listed: ${primaryRace}`);
    }
    return bonuses;
}

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('create_character')
		.setDescription('Create a new character!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your character\'s name')
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('race')
                .setDescription('Your character\'s race')
                .setRequired(true)
                .addChoices(
                    {name: 'Black Dragonborn', value: 'Black Dragonborn'},
                    {name: 'Blue Dragonborn', value: 'Blue Dragonborn'},
                    {name: 'Brass Dragonborn', value: 'Brass Dragonborn'},
                    {name: 'Bronze Dragonborn', value: 'Bronze Dragonborn'},
                    {name: 'Copper Dragonborn', value: 'Copper Dragonborn'},
                    {name: 'Gold Dragonborn', value: 'Gold Dragonborn'},
                    {name: 'Green Dragonborn', value: 'Green Dragonborn'},
                    {name: 'Red Dragonborn', value: 'Red Dragonborn'},
                    {name: 'Silver Dragonborn', value: 'Silver Dragonborn'},
                    {name: 'White Dragonborn', value: 'White Dragonborn'},
                    {name: 'Hill Dwarf', value: 'Hill Dwarf'},
                    {name: 'Mountain Dwarf', value: 'Mountain Dwarf'},
                    {name: 'Dark Elf (Drow)', value: 'Dark Elf'},
                    {name: 'High Elf', value: 'High Elf'},
                    {name: 'Wood Elf', value: 'Wood Elf'},
                    {name: 'Forest Gnome', value: 'Forest Gnome'},
                    {name: 'Rock Gnome', value: 'Rock Gnome'},
                    {name: 'Half-Elf', value: 'Half-Elf'},
                    {name: 'Half-Orc', value: 'Half-Orc'},
                    {name: 'Lightfoot Halfling', value: 'Lightfoot Halfling'},
                    {name: 'Stout Halfling', value: 'Stout Halfling'},
                    {name: 'Human', value: 'Human'},
                    {name: 'Tiefling', value: 'Tiefling'},
                )
            )
        .addStringOption(option =>
            option.setName('class')
                .setDescription('Your character\'s starting class')
                .setRequired(true)
                .addChoices(
                    {name: 'Barbarian', value: 'Barbarian'},
                    {name: 'Bard', value: 'Bard'},
                    {name: 'Cleric', value: 'Cleric'},
                    {name: 'Druid', value: 'Druid'},
                    {name: 'Fighter', value: 'Fighter'},
                    {name: 'Monk', value: 'Monk'},
                    {name: 'Paladin', value: 'Paladin'},
                    {name: 'Ranger', value: 'Ranger'},
                    {name: 'Rogue', value: 'Rogue'},
                    {name: 'Sorcerer', value: 'Sorcerer'},
                    {name: 'Warlock', value: 'Warlock'},
                    {name: 'Wizard', value: 'Wizard'},
                )
            )
        ,
    
    // This is the code that runs when the command is called.
    /**
     * 
     * @param {BaseInteraction} interaction 
     * @returns 
     */
	async execute(interaction) {
        // Create a character based on the options selected
        const db = new Database('dnd.db', {verbose: console.log})

        const userId = interaction.user.id;
        let userRow = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
        // If the user row does not exist, add it
        if (!userRow) {
            db.prepare('INSERT INTO Users(id) VALUES(?)').run(userId);
            userRow = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
        }
        // If the user row already specifies an active character, warn the user and cancel creation
        if (userRow.active_character_id) {
            interaction.reply({content: 'You already have an active character!'});
            return;
        }
        // Retrieve the options and verify that name is correct
        let characterName = '';
        characterName = interaction.options.getString('name')
        characterName = characterName.trim();
        if (!characterName.match(/[A-Za-z]/)) {
            interaction.reply('Invalid Name! The name must have an alphabetical character!');
            return;
        }

        const characterRace = interaction.options.getString('race');
        const characterClass = interaction.options.getString('class');
        console.log(`Character race: ${characterRace}`);
        console.log(`Character class: ${characterClass}`);

        interaction.reply('Creating your character...')

        // Roll the new character's stats
        let statRolls = [];
        // 6 ability scores. Str, Dex, Con, Int, Wis, Cha
        const NUMOFABILITYSCORES = 6;
        // Each element in statRolls is the sum of the results of 4d6d1
        for (let i = 0; i < NUMOFABILITYSCORES; i++) {
            statRolls.push(Dice.rollDice(4, 6, 1).reduce((a, b) => a + b, 0));
        }

        interaction.channel.send(`You rolled these stat values: **${statRolls.join(', ')}**\n` +
                                 'Assign your stats by sending a message with each ability score, starting with the one ' +
                                 ' you want to have the highest roll, and ending with the one you want to have the lowest roll.\n' +
                                 'Example message: strength, dexterity, constitution, intelligence, wisdom, charisma');
        // TODO: Show the user their character's abililty score bonuses from race,
        // ...inform them that if they get to choose atribute bonuses, that happens next
        const raceAbilityBonuses = raceAbilityScoreBonuses(characterRace);
        console.log(`raceAbilityBonuses: ${JSON.stringify(raceAbilityBonuses)}`);

        // Receive the stats message from the user
        const filter = m => m.author.id == userId;
        let statsMsgValid = false;
        let statsMsg = '';
        const statsUsage = 'Send your message like this: strength, dexterity, constitution, intelligence, wisdom, charisma';
        let abilityScores = {};
        while (!statsMsgValid) {
            interaction.channel.send('Assign your stat rolls by sending a message with your stats from highest to lowest.')
            statsMsg = await interaction.channel.awaitMessages({filter, max: 1})
            statsMsg = statsMsg.first().content;
            // Check if the stats msg is valid and prepare the array
            const statsMsgArray = statsMsg.split(',');
            if (statsMsgArray.length != 6) {
                interaction.channel.send('Invalid number of ability scores.\n' + statsUsage);
                continue;
            }
            // Step 1: Assigns an object with the rolls for each ability score to abilityScores 
            abilityScores = allocateAbilityScores(statsMsgArray, statRolls);
            console.log(`abilityScores: ${JSON.stringify(abilityScores)}`);
            if (abilityScores != false) statsMsgValid = true;
        }
        // Step 2: Add relevant ability score bonuses, and display
        for (const ability in raceAbilityBonuses) {
            console.log(`for ability: ${ability}`);
            abilityScores[`${ability}`] += raceAbilityBonuses[ability];
        }

        // TODO: Prompt to add remaining ability score bonuses, if any (like when human race gives you points to freely allocate)

        // Finally, display the final ability scores
        interaction.channel.send(`${characterName}'s final ability scores: \n${JSON.stringify(abilityScores)}`)
        // TODO: Starting Equipment/Money

        // Initialize the character into the relevant tables
        interaction.channel.send("Would you like to keep this character?");
        // TODO: Make a while loop here
        let isCommitted = await interaction.channel.awaitMessages({filter, max: 1})
        if (isCommitted.first().toLowerCase() != 'yes') {
            db.close();
            interaction.channel.send(`Cancelling character creation of ${characterName}`);
            return;
        }

        // TODO: Insert the stats into the database
        db.prepare('INSERT INTO Characters(owner_id, name) VALUES(?, ?)').run(userId, characterName);
        const characterId = db.prepare('SELECT character_id FROM Characters WHERE owner_id = ? AND name = ?').get(userId, characterName).character_id;
        db.prepare('INSERT INTO Statblocks(id, race, class) VALUES(?, ?, ?)').run(characterId, characterRace, characterClass);
        db.prepare('UPDATE Users SET active_character_id = ? WHERE id = ?').run(characterId, userId);

        // Confirm to the user that the character was created
        await interaction.followUp(`Created your new character, **${characterName} the ${characterRace} ${characterClass.toLowerCase()}**.\n` +
                                'To finish your character and roll stats, use the **/statsRoll** command!');

        db.close();
        return;
	},
};