const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");

module.exports = sequelize => {
  sequelize.define(
    "UserRoles",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      level: {
        allowNull: false,
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps: false,
      tableName: "users_roles"
    }
  );
};
