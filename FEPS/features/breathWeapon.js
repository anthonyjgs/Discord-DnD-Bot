// eslint-disable-next-line no-unused-vars
const Character = require('../../dndlibs/character');

/** Tweak description to reflect the specifics of the calling character
 * @param {Character.Character} character The character useing this feature
 * @returns 
 */
function descriptionEdits(character) {
    const raceObj = character.getPrimaryRaceObj();
    const subrace = character.getSubRace.toLowerCase();
    const damageType = raceObj.damageType(subrace);
    return `Your breath weapon deals ${damageType} damage.`;
}


module.exports = {
    name: 'Breath Weapon',
    description: (
        'You can use your action to exhale destructive energy. Your draconic',
        'ancestry determines the size, shape, and damage type of the',
        `exhalation.\n${descriptionEdits()}`
    ),

    /**
     * 
     * @param {Character.Character} character 
     * @param {*} target The target of the breath attack
     */
    use(character, target=null) {
        if (character.getRace().toLowerCase() != "dragonborn") throw console.error(
            `${character.name} is not a Dragonborn!`);

        const raceObj = character.getPrimaryRaceObj();
        const ancestry = character.getSubRace().toLowerCase();
        const damageType = raceObj.damageType(ancestry);

        if (target) {
            // TODO: Check if target is within range and deal damage
        }

        return `${character.name} used their ${damageType} breath weapon!`;
    },
    
}