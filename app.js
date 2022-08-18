/* This is the node entrypoint for the Dungeons and Discord Bot.
    This file mainly serves to connect seperate parts together and get the bot running.
    Commands and events are seperated out into other files.
*/

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
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Setup command variables, path, and get commandFiles
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

// The command handler setup:
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    /* Set a new item in the commands Collection, with the key as the command name
    and the value as the exported module. */
    client.commands.set(command.data.name, command);
}

// The event handler:
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// Uses files in the events dir instead of coding it all here in app.js
// For each file, defines the relevant event function
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
    /* If an event happens with the same name as defined in one of the event files
        then it will run the execute code found within that same file.*/
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Login to discord with the bot token
client.login(botToken);