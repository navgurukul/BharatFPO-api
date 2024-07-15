const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const contact_us = sequelize.define('contact_us', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `Full name`,
            allowNull: false,
        },
        mobile: {
            type: type.STRING(20),
            allowNull: true,
            comment: `Phone Number`,
        },
        email: {
            type: type.STRING(200),
            allowNull: true,
            comment: `Email Id`,
            validate: { isEmail: true }
        },
        query_text: {
            type: type.TEXT,
            allowNull: true,
            comment: `Your Query`
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return contact_us;
};
