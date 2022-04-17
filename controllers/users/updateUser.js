const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const redis = require("../../config/redis");
const setDefaultPassword = require("../../utils/defaultPassword");
const sequelize = require("../../sequelize");
const { Users, Permissions } = sequelize.models;
const {
  execludeAttribute,
  permissionsInclude,
  filterPermissions,
  getPermissionId
} = require("./_functions");
const beautify = require("../../utils/beautifyAssociation");

/* @des         **Update a User (user's data only NO PERMISSIONS)**
                1-Check if requested User Id is found in database
                2-Check If requested User Id is not for a Super Admin to protect super admin from any updates
                3-Check for resetPassword Param in request body to reset the password to the default password format through an external function
                4-Update the user in the database
                5-Get Available Permissions allowed to be granted to the target user
                  by finding the common permissions between the updater user's permissions and the target user role's permissions through an external function
                6-Responde back with the updated user's new data and the available permissions for him
                7-Remove user from redis to log him out on any update

*/
// @route       PUT /api/v2/users/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  //1- Get User by the requested Id from database
  let uzer = await Users.findByPk(req.params.id, {
    ...permissionsInclude,
    ...execludeAttribute
  });
  // If User with the requested Id Not found
  if (!uzer) {
    return next(
      new ErrorResponse(`User with ID ${req.params.id} not found`, 404)
    );
  }
  // If User Found
  else {
    //2- Check that it's role is not "SuperAdmin"
    // To Protect Super Admin from updates by others
    if (uzer.role == "superAdmin") {
      return next(new ErrorResponse("Don't mess with Super Admin", 401));
    }
    //3- If Not SuperAdmin .. Check for resetPassword Param in request body
    else {
      // Handle Reset Password
      if (req.body.resetPassword) {
        req.body.password = setDefaultPassword(uzer.username);
      }

      // Handle Permissions if User's role changed

      if (req.body.role && req.body.role != uzer.role) {
        // Filter Permissions by name and Ids
        //1- Get Permission IDs by filtering them and getting common permissions between requesting user's permissions , requested permissions and target user role available permissions
        let permissionsIds = await getPermissionId(
          req.user,
          beautify(uzer.dataValues.All_Permissions, "name"),
          req.body.role
        );

        // 3-Get Default Permissions IDs that has to be set by default for the target user role
        let defaultPermissions = await Permissions.findAll({
          where: { permissionType: req.body.role, setByDefault: true }
        });
        defaultPermissions = beautify(defaultPermissions, "id");

        // Filter Permissions Array to remove duplicates
        let filteredPermissions = [
          ...new Set([...permissionsIds, ...defaultPermissions])
        ];
        //4- Set New Permissions in UsersPermissions Table in Database
        uzer.setAll_Permissions(filteredPermissions);
      }

      try {
        //4- Update user in Database
        await Users.update(req.body, { where: { id: req.params.id } });

        // Get Updated User from database after updating it
        let user = await Users.findByPk(req.params.id, {
          ...execludeAttribute,
          ...permissionsInclude
        });

        //5- Get Available Permissions allowed to be granted to the target user
        // by finding the common permissions between the updater user's permissions and the target user role's permissions
        const availabePermissions = await filterPermissions(
          user.role,
          req.user
        );

        // 6-Responde back with the updated user's new data and the available permissions for him
        res.status(201).json({
          success: true,
          data: user,
          availabePermissions
        });

        //7- Logout User On any update
        // Remove user from redis to log him out
        redis.del(req.params.id);
      } catch (e) {
        return new ErrorResponse("Failed to update", 400);
      }
    }
  }
});
