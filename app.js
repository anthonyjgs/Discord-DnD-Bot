// Setup access to discord.js module via Discord const
const Discord = require("discord.js");
// Create bot client and its intents
const client = new Discord.Client({intents: ["GuildMessages"]});

// Setup the environment variables
/* NOTE: the .env variables do not autocomplete, but they are still accessed
    via process.env.VARIABLE_NAME*/
require('dotenv').config()
const botToken = process.env.DISCORD_TOKEN;

// Runs when the bot finishes starting up
client.once("ready", () => {
    console.log("DnD bot is online!");
})

// Required to login as the bot
client.login(botToken);