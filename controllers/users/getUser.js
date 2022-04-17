const asyncHandler = require("../../middleware/async");
const beautify = require("../../utils/beautifyAssociation");
const { execludeAttribute, permissionsInclude } = require("./_functions");
const ErrorResponse = require("../../utils/errorResponse");
const sequelize = require("../../sequelize");
const { Users } = sequelize.models;

/* @des         **Get Single User**
                  Get all user's data from database and it's assocciation with permissions
                  Modify Permissions Format and return them back with user's data
*/
// @route       GET /api/v2/users/:id
// @access      Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  // Get User from database by request paramter ID
  const user = await Users.findByPk(req.params.id, {
    ...execludeAttribute,
    ...permissionsInclude,
  });

  // If User Id not found in database
  if (!user) {
    return next(
      new ErrorResponse(`User with ID ${req.params.id} not found`, 404)
    );
  }

  // User Found in database is returned with it's assocciation with complex Arrya format
  // So we Modifiy this Permissions Array format to make it readable
  user.dataValues.All_Permissions = beautify(user.All_Permissions, "name");

  res.status(200).json({ success: true, data: user.dataValues });
});
