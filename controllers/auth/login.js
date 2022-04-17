const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const beautify = require("../../utils/beautifyAssociation");
const { matchPassword, sendTokenResponse } = require("./_functions");
const sequelize = require("../../sequelize");
const { permissionsInclude } = require("../users/_functions");
const { Users } = sequelize.models;

/* @des         **Login User**
                  1-Check for email and password existance in the request body
                  2-Find and check for user existence in DB
                  3- If found Match user entered password to hashed password in database
                  4- Check User Status (Enabled - Disabled) to allow him to login or not
                  5- If All Checks Passed Save user (id,permissions,status) in redis to know later who is logged in
                  6-Allow user to login and send token in response through external function
*/
// @route       POST /api/v2/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body;

  //1- Validation email and password existance
  if ((!email && !username) || !password) {
    return next(
      new ErrorResponse(`Please provide an Email/Username and Password`, 400)
    );
  }

  let emailOrUsername = email ? { email } : { username };

  //2- Find and check for user existence in DB
  const user = await Users.findOne({
    where: { ...emailOrUsername },
    ...permissionsInclude
  });

  //if user not found in DB
  if (!user) return next(new ErrorResponse("Invalid Credentials", 401));

  //3- Match user entered password to hashed password in database
  const isMatch = await matchPassword(password, user.dataValues.password);
  if (!isMatch) return next(new ErrorResponse(`Invalid Password`, 401));

  // Check User Status (Enabled - Disabled)
  if (!user.isActive) return next(new ErrorResponse(`User is Disabled`, 401));

  // Save User's Permissions in Redis Cache Database
  user.All_Permissions = beautify(user.All_Permissions, "name");

  sendTokenResponse(user, 200, res);
});
