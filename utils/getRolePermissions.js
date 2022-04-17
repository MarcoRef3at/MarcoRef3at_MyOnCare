const beautify = require("./beautifyAssociation");
const sequelize = require("../sequelize");
const { Op } = require("sequelize");
const { Permissions, UserRoles } = sequelize.models;

const getRolePermissions = async (userRole) => {
  // Target user role level
  let { level } = await UserRoles.findOne({ where: { name: userRole } });
  // Lower Roles Levels
  let childRoles = beautify(
    await UserRoles.findAll({
      where: { level: { [Op.gt]: level } },
    }),
    "name"
  );

  return await Permissions.findAll({
    where: { permissionType: { [Op.in]: [userRole, ...childRoles] } },
    attributes: { exclude: ["id", "createdAt", "updatedAt"] },
  });
};

module.exports = getRolePermissions;
