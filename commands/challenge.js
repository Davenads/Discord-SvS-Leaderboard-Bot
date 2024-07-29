const { Op } = require('sequelize');
const { PermissionsBitField, ChannelType } = require('discord.js');
const User = require('../models/User');
const Challenge = require('../models/Challenge');

module.exports = {
    name: 'challenge',
    description: 'Challenges another player',
    options: [
        {
            name: 'placementnumber',
            type: 4, // INTEGER
            description: 'Placement number of the character you want to challenge',
            required: true,
        },
        {
            name: 'yourcharactername',
            type: 3, // STRING
            description: 'Your character name if you have multiple characters',
            required: true,
        },
    ],
    async execute(interaction) {
        const challengerId = interaction.user.id;
        const challengerCharacterName = interaction.options.getString('yourcharactername');
        const challengedPlacement = interaction.options.getInteger('placementnumber');

        console.log(`Challenger ID: ${challengerId}`);
        console.log(`Challenger Character Name: ${challengerCharacterName}`);
        console.log(`Challenged Placement: ${challengedPlacement}`);

        const challenger = await User.findOne({ where: { discordId: challengerId, characterName: challengerCharacterName } });

        if (!challenger) {
            console.log(`Error: Challenger character ${challengerCharacterName} not found for user ${challengerId}`);
            await interaction.reply('Error: Your character must be on the leaderboard.');
            return;
        }

        console.log(`Challenger found: ${JSON.stringify(challenger)}`);

        const leaderboard = await User.findAll({ order: [['position', 'ASC']] });

        if (challengedPlacement < 1 || challengedPlacement > leaderboard.length) {
            await interaction.reply('Error: Invalid placement number.');
            return;
        }

        const challenged = leaderboard[challengedPlacement - 1];

        console.log(`Challenged User: ${JSON.stringify(challenged)}`);

        if (challenger.discordId === challenged.discordId) {
            await interaction.reply('Error: You cannot challenge one of your own characters.');
            return;
        }

        const ongoingChallenges = await Challenge.findAll({
            where: {
                [Op.or]: [
                    { challengerId: challengerId, challengerCharacterName: challengerCharacterName },
                    { challengedId: challengerId, challengedCharacterName: challengerCharacterName },
                    { challengerId: challenged.discordId, challengerCharacterName: challenged.characterName },
                    { challengedId: challenged.discordId, challengedCharacterName: challenged.characterName },
                ]
            }
        });

        console.log(`Ongoing Challenges: ${JSON.stringify(ongoingChallenges)}`);

        if (ongoingChallenges.length > 0) {
            await interaction.reply('Error: Both users must have characters that are not already in challenges.');
            return;
        }

        const challengerIndex = leaderboard.findIndex(user => user.discordId === challengerId && user.characterName === challengerCharacterName);
        const challengedIndex = challengedPlacement - 1;

        if (challengedIndex < challengerIndex - 2 || challengedIndex >= challengerIndex) {
            await interaction.reply('Error: You can only challenge a player up to 2 spots ahead of you in the leaderboard.');
            return;
        }

        await Challenge.create({ challengerId, challengerCharacterName, challengedId: challenged.discordId, challengedCharacterName: challenged.characterName });

        const channelName = `${interaction.user.username}-${challenged.username}`;
        console.log(`Creating channel with name: ${channelName}`);
        console.log(`Everyone role ID: ${interaction.guild.roles.everyone.id}`);
        console.log(`Challenger ID: ${challengerId}`);
        console.log(`Challenged ID: ${challenged.discordId}`);

        try {
            const challengerUser = await interaction.guild.members.fetch(challengerId);
            const challengedUser = await interaction.guild.members.fetch(challenged.discordId);
            const everyoneRole = interaction.guild.roles.everyone;

            console.log(`Fetched Challenger User: ${JSON.stringify(challengerUser)}`);
            console.log(`Fetched Challenged User: ${JSON.stringify(challengedUser)}`);
            console.log(`Fetched Everyone Role: ${JSON.stringify(everyoneRole)}`);
        } catch (fetchError) {
            console.error(`Error fetching users or roles: ${fetchError.message}`);
        }

        try {
            const challengeChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: challengerId,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: challenged.discordId,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            await challengeChannel.send(`🏅 **Callout** 🏅\n\nThe symphony of war played on as <@${challengerId}> called out <@${challenged.discordId}> for their sins 🎵⚔️\n\nJoin\n<#${challengeChannel.id}>`);

            await interaction.reply(`Challenge created! Check out the new channel: <#${challengeChannel.id}>`);
        } catch (error) {
            console.error(`Error creating the challenge channel: ${error.message}`);
            await interaction.reply('Error creating the challenge channel.');
        }
    },
};
