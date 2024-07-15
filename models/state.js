const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const State = sequelize.define('state', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `State name`,
            allowNull: false,
        },
        code: {
            type: type.STRING(10),
            unique: true,
            allowNull: false,
            comment: `State code`
        },
        new_code: {
            type: type.STRING(2),
            unique: true,
            allowNull: false,
            comment: `State code`
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return State;
};
