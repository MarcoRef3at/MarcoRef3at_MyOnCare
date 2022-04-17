const bcrypt = require("bcryptjs");
const { DataTypes } = require("sequelize");

module.exports = sequelize => {
  sequelize.define(
    "Users",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          usernameFormat() {
            if (this.username.length < 5) {
              throw new Error("Username must be at least 5 characters");
            }
          }
        }
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Please Add A Valid Email"
          }
        }
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [6, 32],
            msg: "Password must be at least 6 characters"
          }
        },
        get() {} //prevent password return
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      hooks: {
        // Encrypt Password
        afterValidate: user => {
          if (user.dataValues.password) {
            user.dataValues.password = bcrypt.hashSync(
              user.dataValues.password,
              10
            );
          }
        }
      }
    }
  );
};
