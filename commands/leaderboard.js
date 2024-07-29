// commands/leaderboard.js

const { User, Challenge } = require('../models');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Displays the leaderboard.',
    async execute(interaction) {
        try {
            console.log("Fetching leaderboard data...");

            const users = await User.findAll({
                order: [['position', 'ASC']],
                limit: 10
            });

            const challenges = await Challenge.findAll({
                where: {
                    challengerId: {
                        [Op.not]: null
                    },
                    challengedId: {
                        [Op.not]: null
                    }
                }
            });

            console.log("Leaderboard data fetched:", { users, challenges });

            const leaderboardDescription = users.map((user, index) => {
                return `${index + 1}. ${user.username} (${user.characterName}) - ${user.elo} ELO`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('Leaderboard')
                .setDescription(leaderboardDescription)
                .setColor(0x00AE86);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error executing leaderboard command:", error);

            if (error instanceof ValidationError) {
                console.error("Validation error details:", error.errors);
            }

            await interaction.reply('There was an error displaying the leaderboard.');
        }
    }
};
