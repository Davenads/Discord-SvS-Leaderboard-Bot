//const { User, Challenge, Changelog } = require('../models');
const { Op } = require('sequelize');
const User = require('../models/User')
const Challenge = require('../models/Challenge')
const Changelog = require('../models/Changelog')


module.exports = {
    name: 'reportwin',
    description: 'Reports a win in a challenge',
    options: [
        {
            name: 'winner',
            type: 6, // USER
            description: 'The user who won the challenge',
            required: true,
        },
        {
            name: 'loser',
            type: 6, // USER
            description: 'The user who lost the challenge',
            required: true,
        },
    ],
    async execute(interaction) {
        const winner = interaction.options.getUser('winner');
        const loser = interaction.options.getUser('loser');

        const winnerUser = await User.findOne({ where: { discordId: winner.id } });
        const loserUser = await User.findOne({ where: { discordId: loser.id } });

        if (!winnerUser || !loserUser) {
            await interaction.reply('Error: Both users must be on the leaderboard.');
            return;
        }

        // Update wins and losses
        winnerUser.wins += 1;
        loserUser.losses += 1;

        // Calculate new ELO ratings
        const k = 50;
        const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserUser.elo - winnerUser.elo) / 400));
        const expectedScoreLoser = 1 / (1 + Math.pow(10, (winnerUser.elo - loserUser.elo) / 400));

        const newEloWinner = Math.round(winnerUser.elo + k * (1 - expectedScoreWinner));
        const newEloLoser = Math.round(loserUser.elo + k * (0 - expectedScoreLoser));

        const winnerEloChange = newEloWinner - winnerUser.elo;
        const loserEloChange = newEloLoser - loserUser.elo;

        winnerUser.elo = newEloWinner;
        loserUser.elo = newEloLoser;

        await winnerUser.save();
        await loserUser.save();

        await Challenge.destroy({
            where: {
                [Op.or]: [
                    { challengerId: winner.id, challengedId: loser.id },
                    { challengerId: loser.id, challengedId: winner.id }
                ]
            }
        });

        // Log the result in the changelog
        await Changelog.create({
            winnerId: winner.id,
            winnerCharacterName: winnerUser.characterName,
            loserId: loser.id,
            loserCharacterName: loserUser.characterName,
            winnerEloChange,
            loserEloChange,
        });

        // Switch places in the leaderboard
        const leaderboard = await User.findAll({ order: [['position', 'ASC']] });
        const winnerIndex = leaderboard.findIndex(user => user.discordId === winner.id && user.characterName === winnerUser.characterName);
        const loserIndex = leaderboard.findIndex(user => user.discordId === loser.id && user.characterName === loserUser.characterName);

        if (winnerIndex > -1 && loserIndex > -1) {
            const tempPosition = winnerUser.position;
            winnerUser.position = loserUser.position;
            loserUser.position = tempPosition;

            await winnerUser.save();
            await loserUser.save();
        }

        await interaction.reply(`${winnerUser.characterName} (by ${winnerUser.username}) won against ${loserUser.characterName} (by ${loserUser.username}) and they have switched places in the leaderboard!`);
    },
};
