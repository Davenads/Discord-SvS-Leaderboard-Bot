const User = require('../models/User');
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter');

module.exports = {
  name: 'adduser',
  description: 'Adds a user to the leaderboard',
  options: [
    {
      name: 'charactername',
      type: 3, // STRING
      description: 'Name of the character',
      required: true,
    },
    {
      name: 'specialization',
      type: 3, // STRING
      description: 'Specialization of the character (ES or Vita)',
      required: true,
      choices: [
        { name: 'ES', value: 'ES' },
        { name: 'Vita', value: 'Vita' },
      ],
    },
    {
      name: 'element',
      type: 3, // STRING
      description: 'Element of the character (fire, light, or cold)',
      required: true,
      choices: [
        { name: 'Fire', value: 'fire' },
        { name: 'Light', value: 'light' },
        { name: 'Cold', value: 'cold' },
      ],
    },
  ],
  execute: async function (interaction) {
    const discordId = interaction.user.id;
    const username = interaction.user.username;
    const characterName = interaction.options.getString('charactername');
    let specialization = interaction.options.getString('specialization').toLowerCase();
    let element = interaction.options.getString('element').toLowerCase();

    // Convert specialization and element to the correct case
    specialization = capitalizeFirstLetter(specialization);
    element = capitalizeFirstLetter(element);

    // Check if the user already has two entries with unique elements
    const existingEntries = await User.findAll({ where: { discordId } });
    if (existingEntries.length >= 2) {
      await interaction.reply('Error: You cannot have more than 2 entries in the leaderboard.');
      return;
    }
    if (existingEntries.some(entry => entry.element === element)) {
      await interaction.reply('Error: You cannot have two entries with the same element.');
      return;
    }

    // Determine the next position
    const maxPosition = await User.max('position');
    const position = maxPosition !== null ? maxPosition + 1 : 1;

    try {
      await User.create({ discordId, username, characterName, specialization, element, position });
      await interaction.reply(`User ${characterName} (by ${username}) with element ${element} added to the leaderboard.`);
    } catch (error) {
      await interaction.reply('Error: User already exists with this element or invalid input.');
    }
  },
};
