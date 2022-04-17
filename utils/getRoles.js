const Sequelize = require("../sequelize");
const { UserRoles } = Sequelize.models;
const getRoles = async () => {
  let Roles = [];
  let allRoles = [];
  await UserRoles.findAll({ attributes: ["name"] }).then(async (roles) => {
    Roles = roles;
    await Promise.all(
      Roles.map((role) => {
        return allRoles.push(role.dataValues.name);
      })
    );
  });
  return allRoles;
};

module.exports = getRoles;
