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
                1-Filter request body to prevent user from updating role
                2-Update the user in the database
                3-Responde back with the updated user's new data 
*/
// @route       PUT /api/v2/users/me
// @access      Private/Admin
exports.updateMe = asyncHandler(async (req, res, next) => {
  // 1-Filter request body
  let { username, email, password } = req.body;
  //2- Check that it's role is not "SuperAdmin"
  // To Protect Super Admin from updates by others
  if (req.user.role == "superAdmin") {
    return next(new ErrorResponse("Don't mess with Super Admin", 401));
  } else {
    //3- Update user in Database
    await Users.update(
      { username, email, password },
      { where: { id: req.user.id } }
    );
    try {
      // Get Updated User from database after updating it
      let user = await Users.findByPk(req.user.id, {
        ...execludeAttribute,
        ...permissionsInclude
      });

      // 4-Responde back with the updated user's new data and the available permissions for him
      res.status(200).json({
        success: true,
        data: "User Has Been Updated Successfully, Please Login Again.."
      });

      //5- Logout User On any update
      // Remove user from redis to log him out
      redis.del(req.user.id);
    } catch (e) {
      return new ErrorResponse("Failed to update", 400);
    }
  }
});
