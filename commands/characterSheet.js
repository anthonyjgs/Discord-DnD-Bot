
// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, BaseInteraction } = require('discord.js');
const Character = require('../dndlibs/character');

// This module exports an object named data and an async function called execute
module.exports = {
    // Set the command's name and description
	data: new SlashCommandBuilder()
		.setName('character_sheet')
		.setDescription('Prints out your character sheet to the chat'),
    /**
     * This is the code that runs when the command is called.
     * @param {BaseInteraction} interaction 
     */
	async execute(interaction) {
        // Create a character object from the user's id
        const userId = interaction.user.id;
        const c = Character.characterObjectFromUserId(userId);
        if (!c) {
            // Active character not found
            await interaction.reply(`You do not have an active character!`);
            return;
        }
        // Set each line/section string
        const header = 
            (`NAME: **${c.name}**,\n`+
            `RACE: ${c.race},\n`+
            `CLASS: ${c.charClass},\n`+
            `EXPERIENCE: ${c.experience}`);
        const tempHP = (c.tempHP ? ` + ${c.tempHP}` : ``);
        const subHeader =
            (`HP: ${c.currentHP}/${c.maxHP}${tempHP},\n`+
            `AC: ${c.armorClass},\n`+
            `PROFICIENCY BONUS: ${c.proficiencyBonus},\n`+
            `HIT DICE: ${c.hitDiceCount}d${c.hitDiceSides},\n`+
            `SPEED: ${c.speed},\n`+
            `INITIATIVE: ${c.initiative}`);

        const abScrs = c.abilityScores;
        const abLine = (
            `STR: ${abScrs.strength}, `+
            `DEX: ${abScrs.dexterity}, `+
            `CON: ${abScrs.constitution}, `+
            `INT: ${abScrs.intelligence}, `+
            `WIS: ${abScrs.wisdom}, `+
            `CHA: ${abScrs.charisma}`
        );

        const slots = c.spellSlots;
        var slotsLine = "No spell slots";
        if (slots) {
            var slotsLine = (
                `Cantrips: ${slots.cantrips},\n`+
                `Level 1 Spells: ${slots.slot1},\n`+
                `Level 2 Spells: ${slots.slot2},\n`+
                `Level 3 Spells: ${slots.slot3},\n`+
                `Level 4 Spells: ${slots.slot4},\n`+
                `Level 5 Spells: ${slots.slot5},\n`+
                `Level 6 Spells: ${slots.slot6},\n`+
                `Level 7 Spells: ${slots.slot7},\n`+
                `Level 8 Spells: ${slots.slot8},\n`+
                `Level 9 Spells: ${slots.slot9}`
            );
        }

        const spells = c.spells.join(', ');
        
        const features = c.features.join(', ');
        const proficiencies = c.proficiencies.join(', ');
        const inventory = c.inventory.join(', ');

        const sheetString = (
            `${header}\n${subHeader}\nABILITY SCORES:\n${abLine}\n`+
            `SPELL SLOTS:\n${slotsLine}\nSPELLS: ${spells}\n`+
            `FEATURES: ${features}\nPROFICIENCIES: ${proficiencies}\n`+
            `INVENTORY: ${inventory}`
        );
		await interaction.reply({content: sheetString});
	},
};