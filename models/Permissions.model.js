const { DataTypes } = require("sequelize");

module.exports = sequelize => {
  sequelize.define(
    "Permissions",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },

      label: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },

      module: {
        type: DataTypes.STRING,
        allowNull: false
      },

      permissionType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "admin"
      },
      setByDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    { tableName: "users_permissions" }
  );
};
