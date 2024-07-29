const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');

// Database setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'leaderboard.sqlite',
});

const User = sequelize.define('User', {
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  characterName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  element: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  elo: {
    type: DataTypes.INTEGER,
    defaultValue: 1200,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['discordId', 'element']
    }
  ]
});

async function importCSVData(filePath) {
  await sequelize.sync({ force: true }); // This will drop the table if it exists and create a new one

  const records = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Validate the element field
      if (row['element']) {
        records.push({
          position: parseInt(row['Placement #'], 10),
          characterName: row['Name'],
          specialization: row['specialization'],
          discordId: row['discord userid'],
          username: row['discord username'],
          wins: parseInt(row['wins'], 10) || 0,
          losses: parseInt(row['losses'], 10) || 0,
          elo: parseInt(row['elo'], 10) || 1200,
          element: row['element'],
        });
      } else {
        console.warn(`Skipping row due to missing element: ${JSON.stringify(row)}`);
      }
    })
    .on('end', async () => {
      try {
        await User.bulkCreate(records);
        console.log('CSV file successfully processed and data inserted into the database.');
      } catch (error) {
        console.error('Error inserting data into the database:', error);
      } finally {
        await sequelize.close();
      }
    });
}

const filePath = path.join(__dirname, 'Svs-ladder-export - Season 1 Sign ups.csv');
importCSVData(filePath);
