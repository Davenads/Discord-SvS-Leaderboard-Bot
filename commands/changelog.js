const { EmbedBuilder } = require('discord.js');
const Changelog = require('../models/Changelog');

module.exports = {
    name: 'changelog',
    description: 'Displays the latest changelog entries',

    async execute(interaction) {
        const changelogs = await Changelog.findAll({ order: [['timestamp', 'DESC']], limit: 10 });

        if (changelogs.length === 0) {
            await interaction.reply('No changelog entries found.');
            return;
        }

        const changelogEntries = changelogs.map(log => {
            return `**${log.timestamp.toLocaleString()}**\n` +
                `**Winner**: ${log.winnerCharacterName} (ELO change: ${log.winnerEloChange})\n` +
                `**Loser**: ${log.loserCharacterName} (ELO change: ${log.loserEloChange})\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('Changelog')
            .setDescription(changelogEntries.join('\n'))
            .setFooter({ text: 'Diablo Dueling Leagues', iconURL: 'https://i.imgur.com/yBd7bzV.png' });

        await interaction.reply({ embeds: [embed] });
    },
};
