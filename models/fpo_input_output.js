const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const FpoInputOutput = sequelize.define('fpo_input_output', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fpo_id: {
            type: type.INTEGER,
            comment: `FPO id of this input/output `,
            allowNull: false,
        },
        financial_year_id: {
            type: type.INTEGER,
            allowNull: true,
            comment: `financial year id`
        },
        input_output_type: {
            type: type.INTEGER,
            allowNull: false,
            comment: "input_output_type value - 1:Input, 2:Output",
        },
        season_type: {
            type: type.INTEGER,
            allowNull: false,
            comment: "season_type value - 1:Rabi, 2:Kharif",
        },
        category_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Category id from category table",
        },
        sub_category_id: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Subcategory id from sub_category table, this is the crop",
        },
        quantity: {
            type: type.INTEGER,
            allowNull: false,
            comment: "Quantity of the crop/subcategory",
        },
        unit: {
            type: type.INTEGER,
            allowNull: true,
            comment: "unit of the Quantity. 1:Kg, 2:Liter, 3:carton/Box, 4:others ",
        },
        amount: {
            type: type.BIGINT,
            allowNull: false,
            comment: "amount/cost of the Crop/subcategory ",
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    FpoInputOutput.associate = (models) => {
        FpoInputOutput.belongsTo(models.user_profile, {
          foreignKey: "fpo_id",
          targetKey: "id",
          message: "The provided FPO ID does not exist in the user profile table.",
        });
        FpoInputOutput.belongsTo(models.financial_year, {
            foreignKey: "financial_year_id",
            targetKey: "id",
            message: "The provided financial year ID does not exist in the financial_year table.",
          });
        FpoInputOutput.belongsTo(models.category, {
            foreignKey: "category_id",
            targetKey: "id",
            message: "The provided Category ID does not exist in the category table.",
          });
        FpoInputOutput.belongsTo(models.sub_category, {
            foreignKey: "sub_category_id",
            targetKey: "id",
            message: "The provided Sub Category ID does not exist in the sub_category_id table.",
          });


      };
    return FpoInputOutput;
};
