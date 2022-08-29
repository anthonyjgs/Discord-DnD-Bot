
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
        const character = Character.characterObjectFromUserId(userId);
        if (!character) {
            // Active character not found
            await interaction.reply(`You do not have an active character!`);
            return;
        }
        // TODO: Make and use a character sheet function to return an object
        // with all of the values necessary to print the entire character sheet
        // so I only have to open and close the db once for all those values.
        const sheet = character.getCharacterSheet();
        const header = 
            (`Name: **${sheet.name}**,`,
            `Race: ${sheet.race},`,
            `Class: ${sheet.class},`,
            `Experience ${sheet.xp}`);
        const tempHP = (sheet.tempHP ? ` + ${sheet.tempHP}` : ``);
        const subHeader =
            (`HP: ${sheet.currentHP}/${sheet.maxHP}${tempHP},`,
            `AC: ${sheet.armorClass},`,
            `Proficiency Bonus: ${sheet.proficiencyBonus},`,
            `Hit Dice: ${sheet.hitDice},`,
            `Speed: ${sheet.speed},`,
            `Initiative: ${sheet.initiative}`);

        const abScrs = sheet.abilityScores;
        const abLine = (
            `STR: ${abScrs.strength},`,
            `DEX: ${abScrs.dexterity},`,
            `CON: ${abScrs.constitution},`,
            `INT: ${abScrs.intelligence},`,
            `WIS: ${abScrs.wisdom},`,
            `CHA: ${abScrs.charisma}`
        );

        const slots = sheet.spellSlots;
        const slotsLine = (
            `Cantrips: ${slots.cantrips},`,
            `Level 1 Spells: ${slots.slot1},`,
            `Level 2 Spells: ${slots.slot2},`,
            `Level 3 Spells: ${slots.slot3},`,
            `Level 4 Spells: ${slots.slot4},`,
            `Level 5 Spells: ${slots.slot5},`,
            `Level 6 Spells: ${slots.slot6},`,
            `Level 7 Spells: ${slots.slot7},`,
            `Level 8 Spells: ${slots.slot8},`,
            `Level 9 Spells: ${slots.slot9}`
        );
        const spells = sheet.spells.join(', ');
        
        const features = sheet.features.join(', ');
        const proficiencies = sheet.proficiencies.join(', ');
        const inventory = sheet.inventory.join(', ');

        const sheetString = (
            `${header}\n${subHeader}\nABILITY SCORES\n${abLine}\n`,
            `SPELL SLOTS\n${slotsLine}\n**SPELLS:** ${spells}\n`,
            `**FEATURES:** ${features}\n**PROFICIENCIES:** ${proficiencies}\n`,
            `**INVENTORY:** ${inventory}`
        );
		await interaction.reply({content: sheetString});
	},
};