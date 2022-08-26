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

module.exports = {
    objArrayFromJS,
    objArrayFromJSON,
}