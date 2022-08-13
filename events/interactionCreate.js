// This is called when an interaction happens with the bot.

module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

        if (!interaction.isChatInputCommand()) return;
    
        // Get the command from the client, using commandName from the interaction object
        const command = interaction.client.commands.get(interaction.commandName);

        // If it's not a command, return
        if (!command) {
            console.log(interaction.commandName + " is not a command!");
            return;
        }

        // Execute the command
        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
            // Ephemeral means that only the user who called the command will see this
            interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
	},
};