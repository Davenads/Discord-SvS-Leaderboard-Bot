// models/Changelog.js
module.exports = (sequelize) => {
    const { DataTypes, Model } = require('sequelize');

    class Changelog extends Model {}

    Changelog.init({
        changeDescription: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        sequelize,
        modelName: 'Changelog',
        timestamps: true
    });

    return Changelog;
};
