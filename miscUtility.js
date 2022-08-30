// Keeping my code clean by misc reusable functions living here

const fs = require("node:fs");
const path = require("node:path");

/**
 * Creates an array of objects from all of the JSON files at dirPath
 * @param {String} dirPath 
 * @returns {Array} An array of objects, one for each JSON file at dirPath
 */
 function objArrayFromJSON(dirPath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith(".json"));
    let objects = [];
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const json = fs.readFileSync(filePath);
        objects.push(JSON.parse(json));
    }
    return objects;
}

/**
 * Creates an array of objects from all of the js files at dirPath
 * @param {String} dirPath 
 * @returns {Array} An array of objects, one for each js file at dirPath
 */
function objArrayFromJS(dirPath) {
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith(".js"));
    let objects = [];
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        objects.push(require(filePath));
    }
    return objects;
}

/**
 * Compares one list, selected, with another list, available.
 * When each element of selected is unique AND included in available, returns
 * trimmed, lowercase, array from selected. Otherwise, it returns an error.
 * 1: Duplicate items. 2: Selected item not found in available items
 * @param {Array} selected Array of strings of selections to check
 * @param {Array} available Array of strings representing valid selections
 * @returns {Array} If valid, returns a cleaner version of the 'selected' array
 */
function validateChoices(selected, available) {
    let receivedSelections = [];
    for (let selection of selected){
        selection = selection.trim().toLowerCase();
        if (receivedSelections.includes(selection)) return 1;
        if (!available.includes(selection)) return 2;
        receivedSelections.push(selection);
    }
    return receivedSelections;
}

module.exports = {
    objArrayFromJS,
    objArrayFromJSON,
    validateChoices
}