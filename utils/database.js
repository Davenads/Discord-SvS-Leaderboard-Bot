// utils/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'leaderboard.sqlite',
    logging: false, // Disable logging or set to true to enable
});

const User = require('../models/User')(sequelize);
const Challenge = require('../models/Challenge')(sequelize);
const Changelog = require('../models/Changelog')(sequelize);

module.exports = {
    sequelize,
    User,
    Challenge,
    Changelog,
};
