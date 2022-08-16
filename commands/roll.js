// Imports SlashCommandBuilder from discord.js
const { SlashCommandBuilder  } = require('discord.js');
const { rollDiceString } = require('../dndlibs/dice.js');

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

        console.log("Recieved dice string is " + diceString);
        let resultsArray = rollDiceString(diceString);
        console.log("Results array is " + resultsArray);
        // If the rollDiceString returned false, reply with the usage string
        if (resultsArray[0] == false) {
            await interaction.reply({ content: resultsArray[1], ephemeral: true });
            return false;
        }
        
        let resultsString = "You rolled: ";
        for (let i = 0; i < resultsArray.length; i++) {
            resultsString += ` ${resultsArray[i]} `;
        }

        // Discord reply with results, but also return the array for logic within other commands too.
        await interaction.reply(resultsString);
        return resultsArray;
	}
}