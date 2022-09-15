# Discord Dungeon Master

Video Presentation: [LINK GOES HERE]

This project was developed as my final project for CS50 2022. Discord Dungeon
Master is a Discord bot that aims to add features to your discord server,
specifically to play DnD. This project does not intended to accurately recreate
every element of DnD, but rather automate some of the mechanics to allow for
sessions to be run within the server, without needing a 3rd party website.

However, this is evidently a massive undertaking, so for now the project is
just to demonstrate a proof of concept. Currently you can roll dice using dice
notation and create characters (limited by the items, spells, etc., that I have
created files for).

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
spells should be easy, just need a chat command that calls a use() function for
a chosen item, or a cast() function for a spell.

While the actual user experience is too minimal to be of useful yet, the vast
majority of my work has been on making an extensively modular foundation for
this project with the intention that it will be worked on in the future.

## Installation:

## Setup:

