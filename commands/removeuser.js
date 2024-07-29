const User = require('../models/User');
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter');

module.exports = {
  name: 'removeuser',
  description: 'Removes a user from the leaderboard',
  options: [
    {
      name: 'user',
      type: 6, // USER
      description: 'The user to remove',
      required: true,
    },
    {
      name: 'element',
      type: 3, // STRING
      description: 'Element of the character (fire, light, or cold)',
      required: true,
    },
  ],
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const element = interaction.options.getString('element').toLowerCase();
    const validElements = ['fire', 'light', 'cold'];

    // Validate element
    if (!validElements.includes(element)) {
      await interaction.reply('Error: Element must be "fire", "light", or "cold".');
      return;
    }

    // Convert element to the correct case
    const capitalizedElement = capitalizeFirstLetter(element);

    const result = await User.destroy({
      where: {
        discordId: user.id,
        element: capitalizedElement,
      },
    });

    if (result) {
      await interaction.reply(`User with element ${capitalizedElement} removed from the leaderboard.`);
    } else {
      await interaction.reply('Error: User with this element not found.');
    }
  },
};
