// Collection of functions and objects for characters

const fs = require("node:fs");
const path = require("node:path");

// Races are in a format for easily adding as message choices
let races = new Array()
races = function() {
    const racesPath = '../races';
    const raceFiles = fs.readdirSync(racesPath).filter(file => file.endsWith(".json"));
    let races = []
    for (const file of raceFiles) {
        const filePath = path.join(racesPath, file);
        const race = require(filePath);
        races.push(race);
    }
    return races;
};

/*
const races = [
    {name: 'Black Dragonborn'},
    {name: 'Blue Dragonborn'},
    {name: 'Brass Dragonborn'},
    {name: 'Bronze Dragonborn'},
    {name: 'Copper Dragonborn'},
    {name: 'Gold Dragonborn'},
    {name: 'Green Dragonborn'},
    {name: 'Red Dragonborn'},
    {name: 'Silver Dragonborn'},
    {name: 'White Dragonborn'},
    {name: 'Hill Dwarf'},
    {name: 'Mountain Dwarf'},
    {name: 'Dark Elf (Drow)'},
    {name: 'High Elf'},
    {name: 'Wood Elf'},
    {name: 'Forest Gnome'},
    {name: 'Rock Gnome'},
    {name: 'Half-Elf'},
    {name: 'Half-Orc'},
    {name: 'Lightfoot Halfling'},
    {name: 'Stout Halfling'},
    {name: 'Human'},
    {name: 'Tiefling'}
]
*/

// Classes are in a format for easily adding as message choices
const classes = [
    {name: 'Barbarian', value: 'Barbarian'},
    {name: 'Bard', value: 'Bard'},
    {name: 'Cleric', value: 'Cleric'},
    {name: 'Druid', value: 'Druid'},
    {name: 'Fighter', value: 'Fighter'},
    {name: 'Monk', value: 'Monk'},
    {name: 'Paladin', value: 'Paladin'},
    {name: 'Ranger', value: 'Ranger'},
    {name: 'Rogue', value: 'Rogue'},
    {name: 'Sorcerer', value: 'Sorcerer'},
    {name: 'Warlock', value: 'Warlock'},
    {name: 'Wizard', value: 'Wizard'}
]

module.exports = {
    races,
    classes,

}