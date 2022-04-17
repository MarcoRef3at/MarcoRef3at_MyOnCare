const asyncHandler = require("../../middleware/async");
const beautify = require("../../utils/beautifyAssociation");
const sequelize = require("../../sequelize");
const { Users } = sequelize.models;
const {
  execludeAttribute,
  permissionsInclude,
} = require("../users/_functions");

// @desc        Get current logged in user
// @route       Post /api/v2/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await Users.findByPk(req.user.id, {
    ...execludeAttribute,
    ...permissionsInclude,
  });

  user.dataValues.All_Permissions = beautify(user.All_Permissions, "name");

  res.status(200).json({
    success: true,
    data: user.dataValues,
  });
});
