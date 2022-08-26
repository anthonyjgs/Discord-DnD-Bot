const Character = require('../../dndlibs/character');

/** Tweak description to reflect the specifics of the calling character
 * @param {Character.Character} character The character useing this feature
 * @returns 
 */
function getDescription(character) {
    let descriptionString = 'Breath attack! Bwah!';
    return descriptionString;
}


module.exports = {
    name: 'Breath Weapon',
    description: getDescription(this) || ('You can use your action to exhale',
        'destructive energy. Your draconic ancestry determines the size,',
        'shape, and damage type of the exhalation.'),
    /**
     * 
     * @param {Character.Character} character 
     */
    use(character) {
        if (character.getRace().toLowerCase() != "dragonborn") throw console.error(
            `${character.name} is not a Dragonborn!`);
        
        const ancestry = character.getSubRace().toLowerCase();
        const damageType = new String(() => {
            switch (ancestry) {
                case ('black' || 'copper'):
                    return 'acid';
                case ('blue' || 'bronze'):
                    return 'lightning';
                case ('brass' || 'gold' || 'red'):
                    return 'fire';
                case 'green':
                    return 'poison';
                case ('silver' || 'white'):
                    return 'cold';
                default:
                    throw console.error(`Dragonborn subrace missing from `+
                        `breathweapon damagetype! ${ancestry}`);
            }
        });
    }
}