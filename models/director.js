const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const director = sequelize.define('director', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cin: {
            type: type.STRING(50),
            comment: `CIN of the organisation`,
            allowNull: false,
        },
        din: {
            type: type.STRING(10),
            comment: `DIN of the director`,
            allowNull: false,
        },
        fpo_id: {
            type: type.INTEGER,
            comment: `Organisation/FPO Id`,
            allowNull: false,
        },
        director_name: {
            type: type.STRING(50),
            allowNull: true,
            comment: `Name of Director`,
        },
        designation: {
            type: type.STRING(100),
            allowNull: true,
            comment: `Designation`
        },
        appointment_date: {
            type: type.DATE,
            allowNull: true,
            comment: `Appointment date`
        },
        profile_update: {
            type: type.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: `True if profile is updated by user`,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    director.associate = (models) => {
        director.belongsTo(models.user, {
          foreignKey: "user_id",
          targetKey: "id",
          message: "The provided user ID does not exist in the user table.",
        });
        director.belongsTo(models.user_profile, {
            foreignKey: "fpo_id",
            targetKey: "id",
            message: "The provided fpo ID does not exist in the user_profile table.",
          });
      };


    return director;
};
