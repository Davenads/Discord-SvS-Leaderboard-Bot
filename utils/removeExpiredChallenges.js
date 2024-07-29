// utils/removeExpiredChallenges.js
const Challenge = require('../models/Challenge');
const { Op } = require('sequelize');

module.exports = async function removeExpiredChallenges() {
  const expirationTime = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
  const now = new Date();

  await Challenge.destroy({
    where: {
      createdAt: {
        [Op.lt]: new Date(now - expirationTime)
      }
    }
  });

  console.log('Expired challenges removed');
};
