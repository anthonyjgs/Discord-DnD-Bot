// Create a character!

// Imports SlashCommandBuilder from discord.js
// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, BaseInteraction } = require('discord.js');
const Database = require('better-sqlite3');
const Dice = require('../dndlibs/dice');
const Character = require('../dndlibs/character');

// This module exports an object named data and an async function, execute
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
        // TODO: Incorporate subraces here, and add some comments
        .addStringOption(option =>
            option.setName('race')
                .setDescription('Your character\'s race')
                .setRequired(true)
                .addChoices(...Character.getAllSubRaceNames().map(
                    raceName => {return {name: raceName, value: raceName};}
                    )
                )
        )

        .addStringOption(option =>
            option.setName('class')
                .setDescription('Your character\'s starting class')
                .setRequired(true)
                .addChoices(...Character.classes.map(
                    x => {return {name: x.Name, value: x.Name}}
                ))
            )
        ,
    
    /**
     * This is the code that runs when the command is called.
     * @param {BaseInteraction} interaction 
     * @returns 
     */
	async execute(interaction) {
        // Create a character based on the options selected
        const db = new Database('dnd.db', {verbose: console.log});

        const userId = interaction.user.id;
        let userRow = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
        // If the user row does not exist, add it
        if (!userRow) {
            db.prepare('INSERT INTO Users(id) VALUES(?)').run(userId);
            userRow = db.prepare('SELECT * FROM Users WHERE id = ?').get(userId);
        }
        // If the user row already specifies an active character, warn the user
        // and cancel creation.
        if (userRow.active_character_id) {
            interaction.reply({content: 'You already have an active character!'});
            return;
        }
        // Retrieve the options and verify that name is correct
        let characterName = '';
        characterName = interaction.options.getString('name');
        characterName = characterName.trim();
        if (!characterName.match(/[A-Za-z]/)) {
            interaction.reply('Invalid Name! The name must have an alphabetical character!');
            return;
        }

        // raceStrings is an array of format [subRace, Race]
        const raceStrings = interaction.options.getString('race').split(' ');
        // both primary race and subrace are the relevant race objects
        const primaryRace = Character.races.find(o => o.Name == raceStrings[1]);
        const subRace = primaryRace.SubRaces.find(o => o.Name == raceStrings[0]);

        const classString = interaction.options.getString('class');
        const characterClass = Character.classes.find(o => o.Name == classString);
        console.log(`Character race: ${subRace.Name} ${primaryRace.Name}`);
        console.log(`Character class: ${characterClass.Name}`);

        // Makes it easy for future interaction messages to just use followup()
        interaction.reply('Creating your character...');

        // Roll the new character's stats
        let statRolls = [];
        // 6 ability scores. Str, Dex, Con, Int, Wis, Cha
        const NUMOFABILITYSCORES = 6;
        // Each element in statRolls is the sum of the results of 4d6d1
        for (let i = 0; i < NUMOFABILITYSCORES; i++) {
            statRolls.push(Dice.rollDice(4, 6, 1).reduce((a, b) => a + b, 0));
        }

        interaction.channel.send(
            `You rolled these stat values: **${statRolls.join(', ')}**\n` +
            'Assign your stats by sending a message with each ability score,' +
            ' starting with the one you want to have the highest roll, and ' +
            'ending with the one you want to have the lowest roll.\n' +
            'Example message: strength, dexterity, constitution, ' +
            'intelligence, wisdom, charisma'
        );
        
        // TODO: Show user their character's abililty score bonuses from race,
        // ...inform them that if they get to choose bonuses, that happens next
        const raceAbilityBonuses = Character.getAbilityBonuses(primaryRace, subRace);
        console.log(`raceAbilityBonuses: ${JSON.stringify(raceAbilityBonuses)}`);
        interaction.channel.send(
            `${characterName} has the following ability score bonuses due to` +
            ` their race: ${JSON.stringify(raceAbilityBonuses)}`
        );

        // Receive the stats message from the user
        const filter = m => m.author.id == userId;
        let statsMsgValid = false;
        const statsUsage = 'Send your message like this: strength, dexterity,' +
            ' constitution, intelligence, wisdom, charisma';
        let abilityScores = {};
        while (!statsMsgValid) {
            interaction.channel.send(
                'Assign your stat rolls by sending a message with your stats ' +
                'from highest to lowest.'
            );
            let statsMsg = await interaction.channel.awaitMessages({filter, max: 1});
            statsMsg = statsMsg.first().content;
            // Check if the stats msg is valid and prepare the array
            const statsMsgArray = statsMsg.split(',');
            if (statsMsgArray.length != 6) {
                interaction.channel.send('Invalid number of ability scores.\n' + statsUsage);
                continue;
            }
            // Step 1: Assigns an object with the rolls for each ability score to abilityScores 
            abilityScores = allocateAbilityScores(statsMsgArray, statRolls, interaction);
            console.log(`abilityScores: ${JSON.stringify(abilityScores)}`);
            if (abilityScores != false) statsMsgValid = true;
        }
        // Step 2: Add relevant ability score bonuses, and display
        for (const ability in raceAbilityBonuses) {
            console.log(`for ability: ${ability}`);
            abilityScores[`${ability}`] += raceAbilityBonuses[ability];
        }

        // TODO: Prompt to add remaining ability score bonuses, if any (like 
        // when the human race gives you points to freely allocate)

        // Finally, display the final ability scores
        interaction.channel.send(
            `${characterName}'s final ability scores: \n${JSON.stringify(abilityScores)}`
        );

        // TODO: Starting Equipment/Money

        // TODO Initialize the character into the relevant tables
        interaction.channel.send("Would you like to keep this character? (yes/no)");

        // TODO: Make a while loop here
        let keep = false;
        while (!keep) {
            let isCommitted = await interaction.channel.awaitMessages({filter, max: 1});
            isCommitted = isCommitted.first().content;
            if (isCommitted.toLowerCase() == 'no') {
                db.close();
                interaction.channel.send(`Cancelling character creation of ${characterName}`);
                return;  
            } else if (isCommitted.toLowerCase() == 'yes') {
                keep = true;
            }
        }

        // TODO: Insert the stats into the database
        db.prepare('INSERT INTO Characters(owner_id, name) VALUES(?, ?)')
            .run(userId, characterName);
        const characterId = db.prepare(
            'SELECT character_id FROM Characters WHERE owner_id = ? AND name = ?'
        ).get(userId, characterName).character_id;
        // Fill the Statblocks
        db.prepare(
            'INSERT INTO Statblocks(' +
            'id, race, class, strength, dexterity, constitution, intelligence, wisdom, charisma' +
            ') VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(
            characterId,
            `${subRace.Name} ${primaryRace.Name}`,
            characterClass,
            abilityScores.str,
            abilityScores.dex,
            abilityScores.con,
            abilityScores.int,
            abilityScores.wis,
            abilityScores.cha
        );
        db.prepare('UPDATE Users SET active_character_id = ? WHERE id = ?')
            .run(characterId, userId);

        // TODO: Initialize character at level 1

        // Confirm to the user that the character was created
        await interaction.followUp(
            `Created your new character, **${characterName} the ` +
            `${subRace.Name} ${primaryRace.Name} ` + 
            `${characterClass.toLowerCase()}**.`
        );

        db.close();
        return;
	},
};

// TODO: Make this function export an error string instead of sending messages
// within its own function body.
/**
 * Checks ability scores and, if valid, returns an object with each ability score allocated via properties
 * @param {Array} statsMsgArray The msg content to check and use for allocating stats
 * @param {Array} statRolls The roll values to use for stat allocation, in order from highest to lowest
 */
 function allocateAbilityScores(statsMsgArray, statRolls, interaction) {
    let scores = {str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0};
    // Make a copy of statRolls so the original is not modified
    let statRollsCopy = [...statRolls];
    let statsMsg = [...statsMsgArray];

    // Sort statRollsCopy so highest is at end, makes it easy to use pop() later
    statRollsCopy = statRollsCopy.sort((a,b) => a - b);
    let receivedStats = [];
    for (let stat of statsMsg) {
        stat.trim();
        stat = stat.toLowerCase();
        console.log(`allocate received ${stat}`);
        if (receivedStats.includes(stat)) {
            interaction.channel.send(`Cannot assign duplicate stats: ${stat}`);
            return false;
        }
        receivedStats.push(stat);
        
        let abililtyFound = false;
        for (let ability in scores) {
            if (stat.includes(ability)) {
                // Assign the stat values based on the ability score
                scores[ability] = statRollsCopy.pop();
                abililtyFound = true;
                break;
            }
        }
        if (!abililtyFound) {
            interaction.channel.send(`${stat} is not one of the ability scores`);
            return false;
        }
    }
    return scores;
}