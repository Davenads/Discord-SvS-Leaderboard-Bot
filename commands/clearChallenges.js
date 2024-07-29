const Challenge = require('../models/Challenge');

module.exports = {
    name: 'clearchallenges', // Updated name
    description: 'Clears all challenges from the database',
    options: [],
    async execute(interaction) {
        try {
            await Challenge.destroy({ where: {} });
            await interaction.reply('All challenges have been cleared.');
        } catch (error) {
            console.error(error);
            await interaction.reply('Error clearing challenges.');
        }
    },
};
