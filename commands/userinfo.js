// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies user info!'),
    // This is the code that runs when the command is called.
	async execute(interaction) {
		await interaction.reply("Your tag is: " + interaction.user.tag);
	},
};