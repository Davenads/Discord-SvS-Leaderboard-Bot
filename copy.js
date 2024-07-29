const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'copystructure') {
    if (!args[0]) return message.reply('Please provide the target server ID.');

    const sourceGuild = message.guild;
    const targetGuild = client.guilds.cache.get(args[0]);

    if (!targetGuild) return message.reply('Target guild not found.');

    try {
      // Copy categories and their channels
      for (const category of sourceGuild.channels.cache.filter(channel => channel.type === 4)) {
        const newCategory = await targetGuild.channels.create({
          name: category.name,
          type: 4,
        });

        for (const channel of category.children.cache.values()) {
          await targetGuild.channels.create({
            name: channel.name,
            type: channel.type,
            parent: newCategory.id,
          });
        }
      }

      // Copy channels without a category
      for (const channel of sourceGuild.channels.cache.filter(channel => channel.type !== 4 && !channel.parent)) {
        await targetGuild.channels.create({
          name: channel.name,
          type: channel.type,
        });
      }

      message.reply('Server structure copied successfully!');
    } catch (error) {
      console.error('Error copying server structure:', error);
      message.reply('An error occurred while copying the server structure.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);