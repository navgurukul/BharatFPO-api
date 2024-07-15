const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const MajorBusinessActivities = sequelize.define('major_business_activities', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.TEXT,
            comment: `Major Business Activity name`,
            allowNull: false,
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    return MajorBusinessActivities;
};
