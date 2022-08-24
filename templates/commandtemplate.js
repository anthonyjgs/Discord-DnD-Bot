// This file itself is never called, but it has the basic skeleton needed to start creating commands


// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('commandname_alllowercase')
		.setDescription('Describe the command'),
    // This is the code that runs when the command is called.
	async execute(interaction) {
		await interaction.reply('What discord message do you want to send?');
	},
};