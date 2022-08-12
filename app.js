// Node's native file system module
const fs = require("node:fs");
/* Node's native path utility module. Because "/" is not cross platform,
path.join() is nice because it automatically detects what joiner to use in a
path. */
const path = require("node:path");
// Import GatewayIntentBits, Collection, Client, etc. from discord.js module
const { Client, Collection, GatewayIntentBits } = require("discord.js");
// Setup the environment variables: botToken
/* NOTE: the .env variables do not autocomplete, but they are still accessed
    via process.env.VARIABLE_NAME*/
require('dotenv').config()
const botToken = process.env.DISCORD_TOKEN;

// Create bot client and its intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Setup command variables, path, and get commandFiles
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));


for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    /* Set a new item in the commands Collection, with the key as the command name
    and the value as the exported module. */
    client.commands.set(command.data.name, command);
}

// When the bot client is ready, run this once
client.once("ready", () => {
    console.log("DnD bot is online!");
})

client.on("interactionCreate", async interaction => {
    console.log("Interaction create triggered!");
    if (!interaction.isChatInputCommand()) return;
    
    // Get the command from the client, using commandName from the interaction object
    const command = client.commands.get(interaction.commandName);

    // If it's not a command, return
    if (!command) {
        console.log(interaction.commandName + " is not a command!");
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

// Login to discord with the bot token
client.login(botToken);