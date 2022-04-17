const asyncHandler = require("../../middleware/async");
const beautify = require("../../utils/beautifyAssociation");
const ErrorResponse = require("../../utils/errorResponse");
const redis = require("../../config/redis");
const sequelize = require("../../sequelize");
const { Users, Permissions } = sequelize.models;
const {
  getPermissionId,
  getPermissionNames,
  updateRedis
} = require("./_functions");

/* @des         **Update a User's Permissions**
                1-Get Common Permissions IDs between 3 arrays 
                    1*requesting User Permissions
                    2*requested Permissions
                    3*target user Role available permissions
                2-Get Names of the previous filtered permissions
                3-Get Default Permissions that has to be set by default for the target user role
                4-Set All Previously Filtered Permissions to the user
                5-Update redis database permissions if user is logged in
*/
// @route       PUT /api/v2/users/:id/permissions
// @access      Private/Admin
exports.updateUserPermissions = asyncHandler(async (req, res, next) => {
  if (req.body.permissions) {
    //1- Get User by the requested Id from database
    let uzer = await Users.findByPk(req.params.id);
    // If User with the requested Id Not found
    if (!uzer) {
      return next(
        new ErrorResponse(`User with ID ${req.params.id} not found`, 404)
      );
    }
    // If User Found
    else {
      let user = await Users.findOne({ where: { id: req.params.id } });
      // Filter Permissions by name and Ids
      //1- Get Permission IDs by filtering them and getting common permissions between requesting user's permissions , requested permissions and target user role available permissions
      let permissionsIds = await getPermissionId(
        req.user,
        req.body.permissions,
        user.role
      );
      // 2-Get Names of the previous filtered permissions
      let permissionNames = await getPermissionNames(permissionsIds, user.role);

      // 3-Get Default Permissions IDs that has to be set by default for the target user role
      let defaultPermissions = await Permissions.findAll({
        where: { permissionType: user.role, setByDefault: true }
      });
      defaultPermissions = beautify(defaultPermissions, "id");
      // console.log("defaultPermissions:", [
      //   ...permissionsIds,
      //   ...defaultPermissions
      // ]);
      // Filter Permissions Array to remove duplicates
      let filteredPermissions = [
        ...new Set([...permissionsIds, ...defaultPermissions])
      ];
      //4- Set New Permissions in UsersPermissions Table in Database
      user
        .setAll_Permissions(filteredPermissions)
        .then(() => {
          // Add Filtered Permission to response
          user.dataValues.All_Permissions = permissionNames;

          //5- Update User On Redis on any update
          updateRedis(user, permissionNames);

          res.status(201).json({
            success: true,
            data: user.dataValues
          });
        })
        .catch(e => {
          next(new ErrorResponse(e));
        });
    }
  } else {
    next(new ErrorResponse("Please Provide Permissions", 400));
  }
});
