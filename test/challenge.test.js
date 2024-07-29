const { Client, Intents } = require('discord.js');
const ChallengeCommand = require('../commands/challenge');
const { sequelize, User, Challenge } = require('../utils/database');

// Mock the interaction object
const createMockInteraction = (options = {}) => ({
    user: {
        id: '1234567890',
    },
    options: {
        getString: jest.fn((name) => {
            if (name === 'yourcharactername') return 'testchar';
        }),
        getInteger: jest.fn((name) => {
            if (name === 'placementnumber') return options.placementNumber || 1;
        }),
    },
    guild: {
        members: {
            fetch: jest.fn().mockResolvedValue({ id: '1234567890' }),
        },
        roles: {
            everyone: {
                id: '9876543210',
            },
        },
        channels: {
            create: jest.fn().mockResolvedValue({
                id: 'channel-id',
                send: jest.fn(),
            }),
        },
    },
    reply: jest.fn(),
});

describe('Challenge Command', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await User.create({
            discordId: '1234567890',
            username: 'testuser',
            characterName: 'testchar',
            specialization: 'Warrior',
            element: 'Fire',
            position: 3,
        });
        await User.create({
            discordId: '0987654321',
            username: 'opponent',
            characterName: 'oppchar',
            specialization: 'Mage',
            element: 'Water',
            position: 2,
        });
    });

    afterEach(async () => {
        await User.destroy({ where: {} });
        await Challenge.destroy({ where: {} });
    });

    it('should challenge another player successfully', async () => {
        const interaction = createMockInteraction({ placementNumber: 2 });
        await ChallengeCommand.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('Challenge created!'));
        expect(interaction.guild.channels.create).toHaveBeenCalled();
    });

    it('should not challenge oneself', async () => {
        const interaction = createMockInteraction({ placementNumber: 3 });
        await ChallengeCommand.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('Error: You cannot challenge one of your own characters.'));
    });

    it('should not challenge a player out of range', async () => {
        const interaction = createMockInteraction({ placementNumber: 1 });
        await ChallengeCommand.execute(interaction);
        expect(interaction.reply).toHaveBeenCalledWith(expect.stringContaining('Error: You can only challenge a player up to 2 spots ahead of you in the leaderboard.'));
    });
});
