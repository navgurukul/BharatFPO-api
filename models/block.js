const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const Block = sequelize.define('block', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `Block name`,
            allowNull: false,
        },
        code: {
            type: type.STRING(10),
            unique: true,
            allowNull: false,
            comment: `Block code`
        },
        district_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Foreign Key to district table",
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    Block.associate = (models) => {
        Block.belongsTo(models.district, {
          foreignKey: "district_id",
          targetKey: "id",
          message: "The provided District ID does not exist in the district table.",
        });

      };
    return Block;
};
