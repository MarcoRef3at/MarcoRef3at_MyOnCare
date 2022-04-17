const sequelize = require("../../sequelize");
const dataInit = require("./dataInit");
const usersInit = require("./usersInit");

const { UserRoles, Permissions } = sequelize.models;

module.exports = async () => {
  await dataInit(UserRoles);
  await dataInit(Permissions);
  await usersInit();
};
