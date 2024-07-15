const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const District = sequelize.define('district', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `District name`,
            allowNull: false,
        },
        code: {
            type: type.STRING(10),
            unique: true,
            allowNull: false,
            comment: `District code`
        },
        state_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Foreign Key to state table",
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    District.associate = (models) => {
        District.belongsTo(models.state, {
          foreignKey: "state_id",
          targetKey: "id",
          message: "The provided state ID does not exist in the state table.",
        });

      };
    return District;
};
