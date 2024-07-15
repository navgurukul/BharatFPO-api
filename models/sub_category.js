const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const SubCategory = sequelize.define('sub_category', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.TEXT,
            comment: `Sub - Category name(for Input/Output)`,
            allowNull: false,
        },
        category_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Foreign Key to category table",
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    SubCategory.associate = (models) => {
        SubCategory.belongsTo(models.category, {
          foreignKey: "category_id",
          targetKey: "id",
          message: "The provided category ID does not exist in the category table.",
        });

      };
    return SubCategory;
};
