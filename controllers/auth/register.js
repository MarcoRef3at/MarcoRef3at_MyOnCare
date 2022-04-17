const asyncHandler = require("../../middleware/async");
const sequelize = require("../../sequelize");
const { sendTokenResponse } = require("./_functions");
const { Users } = sequelize.models;

// @des         **Register User**
// @route       POST /api/v2/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await Users.create(req.body);
  sendTokenResponse(user, 200, res);
});
