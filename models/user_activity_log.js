require('dbConnection');
module.exports = (sequelize, type) => {
    const user_activity_log = sequelize.define('user_activity_log', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: type.INTEGER(11),
            defaultValue : null
        },
        tbl_name: {
            type: type.STRING,
            require : true
        },
        record_id: {
            type: type.INTEGER,
            defaultValue : null
        },
        previous_record: {
            type: type.TEXT,
            defaultValue : null
        },
        is_deleted: {
            type: type.BOOLEAN,
            defaultValue: false,
        },
        created_at: {
            type: type.DATE,
            defaultValue: type.NOW
        },
        updated_at: {
            type: type.DATE,
            defaultValue: type.NOW
        },
        is_deleted_by: {
            type: type.INTEGER,
            defaultValue : null
        },
        deleted_at: {
            type: type.DATE,
            defaultValue : null
        },
        created_by: {
            type: type.INTEGER,
            require : true
        },
        updated_by: {
            type: type.INTEGER,
            require : true
        }
    }, { freezeTableName: true, timestamps: false })
    return user_activity_log;
}