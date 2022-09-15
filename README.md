# Discord Dungeon Master

Video Presentation: https://youtu.be/OkeZIAbI6qk

This project was developed as my final project for CS50 2022. Discord Dungeon
Master is a Discord bot that aims to add features to your discord server,
specifically to play DnD. This project does not intended to accurately recreate
every element of DnD, but rather automate some of the mechanics to allow for
sessions to be run within the server, without needing a 3rd party website.

However, this is evidently a massive undertaking, so for now the project is
just to demonstrate a proof of concept. Currently you can roll dice using dice
notation (1d20, for example) and create characters (limited by the items, spells,
etc., that I have created files for).

Users can create a character with stats, equipment, traits, spells, etc., and
their character is saved into an SQLite3 database. While currently very limited,
one of the core concepts with this project is to make it easy to add more later.
Spells, items, features, proficiencies, races, classes, etc., are all quick to
implement via simple javascript files. All I need to do to add something new is
to create a file in the correct directory, then fill out the info. 

Interaction is via bot commands in chat, and as such the
intended use is within a seperate text channel meant specifically for the
Discord Dungeon Master.

New commands and actions are also designed to be easy to implement for the
future. Because characters are their own class, it is easy to retrieve them,
edit their data, and update their database entries. Using items, or casting
spells should be easy, just need a chat command that calls a `use()` function for
a chosen item, or a `cast()` function for a spell.

While the actual user experience is too minimal to be of useful yet, the vast
majority of my work has been on making an extensively modular foundation for
this project with the intention that it will be worked on in the future.

## Installation and Setup:
First, you must have nodejs installed, with npm (usually comes with it):
https://nodejs.org/.

Then you can clone the repository to your folder of choice
like any other github project.

In your terminal, in the same directory as app.js, install the dependencies using
`npm -install`.

Because I do not actively host this bot continuously, it is best if you use
this code to host your own. To do this, setup a Discord application the 
'Creating an App' instructions here: https://discord.com/developers/docs/getting-started,
BUT make sure to give your bot permissions for: read messages/view channels,
send messages, read message history, and use slash commands.

Now that you've created your application on Discord, you need to setup the .env
file. Create a .env file in the same folder as app.js, and inside write the
following code:
```
DISCORD_TOKEN = [YOUR DISCORD BOT TOKEN]
CLIENT_ID = [YOUR CLIENT ID]
GUILD_ID = [YOUR GUILD ID]
```
All three values are found in the developer portal for your bot. DISCORD_TOKEN
is the token you generate for your bot. CLIENT_ID is your application id under
'general information'. GUILD_ID is the server id of the discord server you want
this bot to run on.

Finally, go into the same directory as app.js and run `node deploy-commands`
in your terminal. Now the bot is ready to launch! Just run `node .` or
`node app.js`.

## USING THE BOT:
Once it is running on your server, you should see extra slash commands appear
when you start typing `/` in your message box. Use `/dndhelp` to see the full
list of commands and short descriptions for each.

The main one is `/create_character`. While typing or autocompleting, it should
prompt you for a name, a race, and a class. For race and class it will present
a list of the current options. From here, follow the instructions and prompts
until prompted to keep the character, type `yes` to finalize, and your character
is now saved to the database!

You can view the current stats for your character by using the `/character_sheet`
command.

You will notice that some entries are null in the database, but for almost all
of these, it is because these values do not exist for the majority of play time,
so these will be initialized later as needed (initiative does not exist outside
of combat, for example). Money will be implemented at a later date, when I have
a better idea for how I want to implement economies within the bot.
