// Collection of functions and variables for dice rolling


/**
 * Converts a dice string into the results of rolling those dice. Returns the array:
 * [false, usageString] if string is invalid.
 * @function rollDiceString
 * @param {String} diceString The dice string to convert and roll
 * @return {Array} The array of dice results after rolling
 */
function rollDiceString(diceString) {
    // Prep usage string to return when user enters invalid string
    const usageString = "Dice string must be in the format '#'d'#' or d'#'"
    
    // First check if it's a valid dice string
    diceString.toLowerCase();
    diceString.trim();
    // Matches only dice strings
    diceString = diceString.match(/^((\d*d)|d)((?<=d)\d*|(?<=\d)d){0,3}\d*$/)[0];
    if (!diceString) {
        console.log(usageString);
        return [false, usageString];
    }

    // Split the dice string around 'd'
    let diceArray = diceString.split('d');
    // If diceString was d# or #d# or #d#d#
    if (diceArray.length == 1) return rollDice(1, diceArray[0]);
    else if (diceArray.length == 2) return rollDice(diceArray[0], diceArray[1]);
    else if (diceArray.length == 3) return rollDice(diceArray[0], diceArray[1], diceArray[2]);
    // If the previous if statements were false, the string is likely wrong
    else {
        console.log(usageString);
        return [false, usageString];
    }
}


/**
 * Returns an array of length 'quantity' of random numbers in the range 'sides'.
 * If using a dice string, use rollDiceString instead.
 * @function rollDice
 * @param {*} quantity The number of dice to roll and return
 * @param {*} sides How many sides for each die
 * @param {*} drop How many of the lowest values to drop
 * @return {Array} Array of results of each die
 */
function rollDice(quantity, sides, drop = 0) {
    // Check that quantity and sides are both positive integers, and convert if needed
    for (let i in arguments) {
        if (typeof arguments == String){
            arguments[i] = parseInt(arguments[i]);
        }
        if (arguments[i] < 1) {
            console.log (`arguments[${i}] is ${arguments[i]}"`);
            console.log("Quantity and sides must be positive integers greater than zero!");
            return false;
        }
        arguments[i] = Math.floor(arguments[i]);
    }

    // Calculate all the rolls
    let resultsArray = [];
    for (let i = 0; i < quantity; i++) {
        resultsArray[i] = Math.floor(Math.random() * sides) + 1;
    }
    // Sort the array by numerical value (not ascii character value, which is the default)
    resultsArray.sort((a,b) => a - b).reverse();
    // Drop rolls if necessary
    for (let i = 0; i < drop; i++) {
        resultsArray.pop();
    }
    return resultsArray;
}

// This module exports these things
module.exports = {
    rollDiceString,
    rollDice
}