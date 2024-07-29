// models/Challenge.js
module.exports = (sequelize) => {
    const { DataTypes, Model } = require('sequelize');

    class Challenge extends Model {}

    Challenge.init({
        challengerId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        challengerCharacterName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        challengedId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        challengedCharacterName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        modelName: 'Challenge',
        timestamps: true
    });

    return Challenge;
};
