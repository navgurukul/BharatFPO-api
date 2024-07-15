const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const License = sequelize.define('license', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.TEXT,
            comment: `License name`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return License;
};
