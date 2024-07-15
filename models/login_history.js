require('dbConnection');
module.exports = (sequelize, type) => {
    const loginHistory = sequelize.define('loginHistory', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: `Primary id of login History`
        },
        user_id: {
            type: type.INTEGER,
            required: true,
            comment: `user Id of login History`
        },
        type: {
            type: type.STRING(5),
            comment: `type of login History`
        },
        user_agent: {
            type: type.STRING,
        },
        lat: type.STRING(10),
        lng: type.STRING(10),
        logout_location_lat: type.STRING(10),
        logout_location_lng: type.STRING(10),
        ip_address: type.STRING(20),
        logged_out_at: type.DATE,
        logged_in_at: type.DATE,
        created_at: {
            type: type.DATE,
            defaultValue: type.NOW
        },
        updated_at: {
            type: type.DATE,
            defaultValue: type.NOW
        },
    }, { freezeTableName: true, timestamps: false })
    return loginHistory
}
