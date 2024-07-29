const { InteractionType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = async (interaction) => {
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const commandName = interaction.commandName;
    const commandPath = path.join(__dirname, '../commands', `${commandName}.js`);

    if (fs.existsSync(commandPath)) {
        const command = require(commandPath);
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
        }
    } else {
        await interaction.reply({ content: 'Command not found!', ephemeral: true });
    }
};
