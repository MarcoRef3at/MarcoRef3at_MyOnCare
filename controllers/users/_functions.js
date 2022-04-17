const beautify = require("../../utils/beautifyAssociation");
const getRolePermissions = require("../../utils/getRolePermissions");
const redis = require("../../config/redis");
const sequelize = require("../../sequelize");

const { Op } = require("sequelize");
const getMyPermissions = require("../../utils/getMyPermissions");
const { Users, Permissions, user_has_Permission, UserRoles } = sequelize.models;

const execludeAttribute = {
  attributes: {
    exclude: ["password", "createdAt", "updatedAt"]
  }
};
const permissionsInclude = {
  include: [
    {
      model: Permissions,
      exclude: ["user_has_Permission"],
      as: "All_Permissions",
      attributes: ["name"],
      through: { attributes: [] }
    }
  ]
};

/* External Functions*/

// Filter Permissions by Ids
// 1-Get Common Permissions IDs between 3 arrays
// 1*requesting User Permissions
// 2*requested Permissions
// 3*target user Role available permissions
const getPermissionId = async (
  loggedInUser,
  permissionNames,
  userRole = "user"
) => {
  let filteredPermissions = await filterPermissions(
    userRole,
    loggedInUser,
    permissionNames
  );

  let permissionIds = [];
  await Promise.all(
    filteredPermissions.map(async name => {
      // Get Permissions of target user role and all children roles
      let permission = await Permissions.findOne({
        where: {
          name
        }
      });
      //To Handle misspelled permission names
      //And Repeated Permissions
      if (permission && !permissionIds.includes(permission.dataValues.id)) {
        return permissionIds.push(permission.dataValues.id);
      }
    })
  );
  return permissionIds;
};

// Filter Permissions by names
const getPermissionNames = async (permissionIds, userRole = "user") => {
  // Target user role level
  let { level } = await UserRoles.findOne({ where: { name: userRole } });

  // Lower Roles Levels
  let childRoles = beautify(
    await UserRoles.findAll({
      where: { level: { [Op.gt]: level } }
    }),
    "name"
  );

  let permissionNames = [];
  await Promise.all(
    permissionIds.map(async id => {
      // Get Permissions of target user role and all children roles
      let permission = await Permissions.findOne({
        where: { id, permissionType: { [Op.in]: [userRole, ...childRoles] } }
      });
      //To Handle misspelled permission names
      //And Repeated Permissions
      if (permission && !permissionNames.includes(permission.dataValues.name)) {
        return permissionNames.push(permission.dataValues.name);
      }
    })
  );
  return permissionNames;
};

const filterPermissions = async (role, loggedInUser, permissions) => {
  /* Filter Permissions by getting intersection between 3 arrays
    -LoggedIn User Permissions
    -Target User Role Permissions
    -Requested Permissions
    */

  // Get Current User Permissions from redis
  let myPermissions = await getMyPermissions(loggedInUser);

  // Get Target User role's Available permissions
  let rolePermissions = await getRolePermissions(role);

  // filter intersection between logged in user's permissions and targetUser role's permissions
  let TargetRole_MyPermissions = getArraysIntersections(
    myPermissions,
    beautify(rolePermissions, "name")
  );

  // filter intersection between requested permissions and previously filtered permissions
  if (permissions) {
    return getArraysIntersections(permissions, TargetRole_MyPermissions);
  } else {
    return TargetRole_MyPermissions;
  }
};

const getArraysIntersections = (arr1, arr2) => {
  return arr1.filter(value => arr2.includes(value));
};

// Update redis database permissions if user is logged in
const updateRedis = async (user, permissionNames = []) => {
  redis.hgetall(user.id, (err, usr) => {
    if (usr) {
      redis.hmset(
        user.id,
        "All_Permissions",
        JSON.stringify(permissionNames),
        "isActive",
        user.dataValues.isActive
      );
    }
  });
};

module.exports = {
  execludeAttribute,
  filterPermissions,
  getPermissionId,
  getPermissionNames,
  permissionsInclude,
  updateRedis
};
