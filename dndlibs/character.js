// Collection of functions and objects for characters

const Path = require('node:path');
const Utility = require('../miscUtility');

// Races
const racesPath = Path.resolve('dndlibs', '..', 'races');
const races = Utility.objArrayFromJSON(racesPath);

// Classes
const classesPath = Path.resolve('dndlibs', '..', 'classes');
const classes = Utility.objArrayFromJSON(classesPath);

module.exports = {
    races,
    classes,
}