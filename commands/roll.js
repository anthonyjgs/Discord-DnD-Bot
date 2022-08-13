// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder, RPCCloseEventCodes, ReactionCollector } = require('discord.js');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName("roll")
		.setDescription("Roll a dice!")
        .addStringOption(option => option.setName("dice").setDescription("Input dice to roll").setRequired(true))
        ,
    // This is the code that runs when the command is called.
	async execute(interaction) {
        let diceString = interaction.options.getString("dice");
        diceString.trim();
        const usageString = "dice string should be 'number of dice'd'number of sides'"
        
        // Dice string must start with 'd' or with a number, else return an error
        // TODO: Check if dice string starts with a number ******************************************************************
        if (diceString[0].toLowerCase != "d" || diceString[0] != ())
            interaction.reply({ content: usageString, ephemeral: true })
        await interaction.reply(diceString);
	},
};