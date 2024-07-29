const { Op } = require('sequelize');
const Challenge = require('../models/Challenge');

module.exports = {
    name: 'nullifychallenge',
    description: 'Nullify an ongoing challenge',
    options: [
        {
            name: 'challenger',
            type: 6, // USER
            description: 'Discord ID of the challenger',
            required: true,
        },
        {
            name: 'challenged',
            type: 6, // USER
            description: 'Discord ID of the challenged',
            required: true,
        },
    ],
    async execute(interaction) {
        if (!interaction.member.roles.cache.some(role => role.name === 'SvS Manager')) {
            await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            return;
        }

        const challenger = interaction.options.getUser('challenger');
        const challenged = interaction.options.getUser('challenged');

        try {
            const challenge = await Challenge.findOne({
                where: {
                    [Op.or]: [
                        { challengerId: challenger.id, challengedId: challenged.id },
                        { challengerId: challenged.id, challengedId: challenger.id },
                    ],
                },
            });

            if (!challenge) {
                await interaction.reply({ content: 'No ongoing challenge found between these users.', ephemeral: true });
                return;
            }

            await challenge.destroy();
            await interaction.reply({ content: 'The challenge has been nullified successfully.', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply('Error nullifying challenge.');
        }
    },
};
