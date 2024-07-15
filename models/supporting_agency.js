const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const SupportingAgency = sequelize.define('supporting_agency', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.TEXT,
            comment: `Supporting Agency name`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return SupportingAgency;
};
