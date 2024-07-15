const { DATE } = require('sequelize');
const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const SandboxToken = sequelize.define('sandbox_token', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: type.STRING,
            comment: `token`,
            allowNull: false,
        },
        token_expiry: {
            type: DATE,
            comment: `token Expiry date and time`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return SandboxToken;
};
