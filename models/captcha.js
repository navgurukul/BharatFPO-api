module.exports = (sequelize, type) => {
    const captcha = sequelize.define('captcha', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uuid: {
            type: type.UUID
        },
        captcha_text: {
            type: type.STRING,
            allowNull: true
        },
        os_version: {
            type: type.STRING,
            allowNull: true
        },
        os_release: {
            type: type.STRING,
            allowNull: true
        },
        browser: {
            type: type.STRING,
            allowNull: true
        },
        ip_address: {
            type: type.STRING,
            allowNull: true
        },
        referer: {
            type: type.STRING,
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: type.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    },
        { freezeTableName: true }
    );
    return captcha;
};