/*
This file is used to deploy commands to the bot via files from the commands dir
This file is should be called manually from the command line.
*/

// Imports Routes from discord.js and REST from @discordjs/rest
/* @discordjs/rest is a library for making http REST requests (which is the usual way,
    which includes GET, POST, etc.)*/
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

// Import node fs (Node's native file system module) so it can be used
const fs = require('node:fs');
// Import node's native path utility module
const path = require("node:path");
// Setup access to the .env file
require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
// Load clientId and guildId from environment
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Create an empty array for commands, then make an array of the command files
const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// For each file, push data as JSON to the commands array
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

// Create a REST object and set the token
const rest = new REST({ version: '10' }).setToken(token);

// Actually registers the commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);