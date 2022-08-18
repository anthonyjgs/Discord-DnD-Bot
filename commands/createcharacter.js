// Create a character!

// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');
const Character = require('../dndlibs/character.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('create_character')
		.setDescription('Create a new character!'),
    
    // This is the code that runs when the command is called.
	async execute(interaction) {
        await Character.create_character(interaction);
        return;
	},
};