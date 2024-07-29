// index.js
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const leaderboardCommand = require('./commands/leaderboard.js');
console.log(leaderboardCommand); // This should log the command object
const { sequelize, User, Challenge } = require('./utils/database');
const { Op } = require('sequelize');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name.toLowerCase(), command);
}

const userPages = {};

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const guildId = process.env.GUILD_ID;
    const commands = client.guilds.cache.get(guildId)?.commands;
    const commandData = client.commands.map(({ name, description, options }) => ({ name: name.toLowerCase(), description, options }));

    if (commands) {
        commands.set(commandData)
            .then(() => console.log('Commands deployed successfully.'))
            .catch(console.error);
    }

    try {
        await sequelize.sync();
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName.toLowerCase());

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        console.log(`Button clicked: ${interaction.customId}`);

        if (interaction.customId.startsWith('leaderboard_')) {
            await handleLeaderboardButton(interaction);
        } else {
            await interaction.reply({ content: 'Unknown button interaction.', ephemeral: true });
        }
    }
});

async function handleLeaderboardButton(interaction) {
    const userId = interaction.user.id;
    const [prefix, action] = interaction.customId.split('_');
    console.log(`Action: ${action}`);

    if (!userPages[userId]) {
        userPages[userId] = 1;
    }

    switch (action) {
        case 'first':
            userPages[userId] = 1;
            break;
        case 'previous':
            if (userPages[userId] > 1) userPages[userId]--;
            break;
        case 'next':
            userPages[userId]++;
            break;
        case 'last':
            const totalItems = await User.count();
            const itemsPerPage = 10;
            userPages[userId] = Math.ceil(totalItems / itemsPerPage);
            break;
        default:
            await interaction.reply({ content: 'Unknown action.', ephemeral: true });
            return;
    }

    await displayLeaderboard(interaction, userPages[userId]);
}

async function displayLeaderboard(interaction, page) {
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    const leaderboard = await User.findAll({
        order: [['position', 'ASC']],
        limit: itemsPerPage,
        offset: offset,
    });

    const activeChallenges = await Challenge.findAll({
        where: {
            [Op.or]: [
                { challengerId: { [Op.ne]: null } },
                { challengedId: { [Op.ne]: null } },
            ],
        },
    });

    const activeChallengesDescription = activeChallenges.map((challenge, index) =>
        `#${index + 1}: **${challenge.challengerCharacterName}** (by <@${challenge.challengerId}>) vs **${challenge.challengedCharacterName}** (by <@${challenge.challengedId}>)`
    ).join('\n\n');

    const leaderboardDescription = leaderboard.map((user, index) => {
        const elementEmoji = {
            fire: '🔥',
            light: '💡',
            cold: '❄️',
        }[user.element.toLowerCase()] || '';

        return `#${user.position}: **${user.characterName}** (by ${user.username})\n`
            + `${user.specialization} ${elementEmoji}\n`
            + `W: ${user.wins} | L: ${user.losses} | ELO: ${user.elo}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard 🏆')
        .setDescription(leaderboardDescription)
        .setFooter({ text: `Page ${page}` })
        .setImage('https://i.imgur.com/hwNnlax.png');

    if (activeChallengesDescription) {
        embed.addFields([{ name: 'Ongoing Challenges', value: activeChallengesDescription }]);
    }

    await interaction.update({
        embeds: [embed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'First',
                        style: 1,
                        custom_id: 'leaderboard_first',
                    },
                    {
                        type: 2,
                        label: 'Previous',
                        style: 1,
                        custom_id: 'leaderboard_previous',
                    },
                    {
                        type: 2,
                        label: 'Next',
                        style: 1,
                        custom_id: 'leaderboard_next',
                    },
                    {
                        type: 2,
                        label: 'Last',
                        style: 1,
                        custom_id: 'leaderboard_last',
                    },
                ],
            },
        ],
    });
}

client.login(process.env.DISCORD_TOKEN);
