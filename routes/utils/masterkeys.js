/*  Define as an reuse-able JSON to use many models*/

const { DataTypes: type } = require("sequelize");

module.exports = {
  isActive: {
    type: type.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: type.INTEGER,
    allowNull: false,
  },
};
