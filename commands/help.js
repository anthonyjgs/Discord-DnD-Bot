// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('helpDnD')
		.setDescription('Lists commands for DnD bot and more detailed descriptions'),
    // This is the code that runs when the command is called.
	async execute(interaction) {
        let helpString = "DND BOT HELP:\n";
        interaction.client.commands
		await interaction.reply({content: helpString, ephemeral: true});
	},
};