// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder } = require('discord.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('helpdnd')
		.setDescription('Lists commands for DnD bot and descriptions'),
    
    // This is the code that runs when the command is called.
	async execute(interaction) {
        let helpString = "DND BOT HELP:";

        // Retrieve the data for each command
        let commandArray = Array.from(interaction.client.commands);
        for (const i in commandArray) {
            let commandData = commandArray[i][1].data;
            let name = commandData.name;
            let description = commandData.description;
            
            helpString += `\n${name} ---- ${description}`;
        }

		await interaction.reply({content: helpString, ephemeral: true});
	},
};