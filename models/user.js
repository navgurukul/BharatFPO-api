const masterKeys = require('../routes/utils/masterkeys');
module.exports = (sequelize, type) => {
    const User = sequelize.define('user', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: type.STRING(50),
            comment: `User name`,
            allowNull: false,
        },
        email: {
            type: type.STRING(200),
            unique: true,
            allowNull: false,
            comment: `User email id`,
            validate: { isEmail: true }
        },
        mobile: {
            type: type.STRING(20),
            allowNull: true,
            comment: `User Phone Number`,
        },
        password: {
            type: type.STRING(255),
            comment: `User password`,
            allowNull: true,
        },
        role_id: {
            type: type.INTEGER,
            allowNull: true,
        },
        profile_img:{
            type: type.TEXT,
            allowNull: true,
            comment: `User Profile Image URL`,
        },
        is_password_change: {
            type: type.BOOLEAN,
            comment: `True if password is changed `,
            allowNull: false,
            defaultValue: false
        },
        google_auth: {
            type: type.BOOLEAN,
            comment: `True if Google id `,
            allowNull: false,
            defaultValue: false
        },
        ...masterKeys
    },
        { freezeTableName: true }
    );
    User.associate = (models) => {
        User.hasOne(models.user_profile, {
          foreignKey: "user_id",
          targetKey: "id",
          message: "The provided user profile ID does not exist in the user table.",
        });
        User.hasMany(models.favourite_fpo, {
            foreignKey: "user_id"
          });
    }
    return User;
};
