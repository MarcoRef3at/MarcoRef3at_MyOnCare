function applyExtraSetup(sequelize) {
  const { Users, Permissions, UserRoles } = sequelize.models;

  // Users - Permissions many to many association
  Users.belongsToMany(Permissions, {
    as: "All_Permissions",
    through: "user_has_Permission"
  });

  // role column in Users Table is forieignKey from UserRoles Table
  Users.belongsTo(UserRoles, {
    foreignKey: "role",
    targetKey: "name"
  });

  // permissionType column in Permissions Table is forieignKey from UserRoles Table
  Permissions.belongsTo(UserRoles, {
    foreignKey: "permissionType",
    targetKey: "name"
  });
}

module.exports = { applyExtraSetup };
