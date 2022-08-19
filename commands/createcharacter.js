// Create a character!

// Imports SlashCommandBuilder from discord.js
// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, BaseInteraction } = require('discord.js');
const Database = require('better-sqlite3');
const Dice = require('../dndlibs/dice');

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
                    {name: 'Dark Elf (Drow)', value: 'Drow'},
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
        // 6 attributes. Str, Dex, Con, Int, Wis, Cha
        const NUMOFATTRIBUTES = 6;
        // Each element in statRolls is the sum of the results of 4d6d1
        for (let i = 0; i < NUMOFATTRIBUTES; i++) {
            statRolls.push(Dice.rollDice(4, 6, 1).reduce((a, b) => a + b, 0));
        }

        interaction.channel.send(`You rolled these stat values: **${statRolls.join(', ')}**\n` +
                                 'Assign your stats by sending a message with each attribute, starting with the one ' +
                                 ' you want to have the highest roll, and ending with the one you want to have the lowest roll.\n' +
                                 'Example message: strength, dexterity, constitution, intelligence, wisdom, charisma');
        // TODO: Show the user their character's attribute bonuses from race,
        // ...inform them that if they get to choose atribute bonuses, that happens next

        // Receive the stats message from the user
        const filter = m => m.author.id == userId;
        let statsMsgValid = false;
        let statsMsg = '';
        while (!statsMsgValid) {
            statsMsg = await interaction.channel.awaitMessages({filter, max: 1}).first().content;
            // TODO: Check if the stats msg is valid and prepare the array
        }
        // TODO: Step1 of applying attributes. Add relevant rolls with the attribute bonuses, and display

        // TODO: Prompt to add remaining attribute bonuses

        // TODO: Starting Equipment/Money

        // Initialize the character into the relevant tables
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