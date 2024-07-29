const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const clearCommands = async () => {
  try {
    console.log('Started clearing application (/) commands.');

    // Clear guild-specific commands
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] },
    );

    // Clear global commands
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] },
    );

    console.log('Successfully cleared application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

clearCommands();
