const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const Category = sequelize.define('category', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.TEXT,
            comment: `Category name(for Input/Output)`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return Category;
};
