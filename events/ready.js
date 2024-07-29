const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        if (command.name && command.description) {
            commands.push({
                name: command.name,
                description: command.description,
                options: command.options || []
            });
        } else {
            console.error(`Command file ${file} is missing name or description.`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};
