const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const favourite_fpo = sequelize.define('favourite_fpo', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
          type: type.INTEGER,
          allowNull: false,
          comment: "Foreign Key to user table",
        },
        type:{
            type: type.INTEGER,
            comment: `Types: 1=visit, 2=saved`,
            allowNull: false,
        },
        fpo_id: {
            type: type.INTEGER,
            comment: `FPO name`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    favourite_fpo.associate = (models) => {
        favourite_fpo.belongsTo(models.user, {
          foreignKey: "user_id",
          targetKey: "id",
          message: "The provided user ID does not exist in the user table.",
        });
        favourite_fpo.belongsTo(models.user, {
          foreignKey: "createdBy",
          targetKey: "id",
          message: "The provided user ID does not exist in the user table.",
        });
        favourite_fpo.belongsTo(models.user_profile, {
            foreignKey: "fpo_id",
            targetKey: "id",
            message: "The provided fpo id does not exist in the user profile table.",
          });
      };

    return favourite_fpo;
};
