const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const FinancialYear = sequelize.define('financial_year', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `Financial year name`,
            allowNull: false,
        },
        start_date: {
            type: type.DATE,
            allowNull: false,
            comment: `financial year start date`
        },
        end_date: {
            type: type.DATE,
            allowNull: false,
            comment: `financial year end date`
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return FinancialYear;
};
