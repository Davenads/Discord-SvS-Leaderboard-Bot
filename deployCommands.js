const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'leaderboard',
        description: 'Displays the leaderboard',
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
        name: 'removeuser',
        description: 'Removes a user from the leaderboard',
        options: [
            {
                name: 'charactername',
                type: 3, // STRING
                description: 'Name of the character to remove',
                required: true,
            },
        ],
    },
    {
        name: 'nullifychallenge',
        description: 'Nullifies an ongoing challenge',
        options: [
            {
                name: 'challenger',
                type: 6, // USER
                description: 'The user who initiated the challenge',
                required: true,
            },
            {
                name: 'challenged',
                type: 6, // USER
                description: 'The user who was challenged',
                required: true,
            },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const deployCommands = async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        // Deploy guild-specific commands
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        // Deploy global commands
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

deployCommands();
