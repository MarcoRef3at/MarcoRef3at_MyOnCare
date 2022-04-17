const jwt = require("jsonwebtoken");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const redis = require("../../config/redis");
const sequelize = require("../../sequelize");
const { Users } = sequelize.models;

/* @desc        **Log user out**
                1-Get Token from request Headers or from Cookies 
                2-If Token wasn't found then respond to user that he/she is already logged out
                3-If Token Found, Validate it and get user's info from it and save it to req.user to use it later in removing his data from redis
                4-Clear Cookies
                5-Delete User from redis 
                6-Responde to User that he was succefully logged out
*/
// @route       GET /api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
  let token;

  // Set Token from Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    //console.log('token', token);
  }

  // Set Token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token || token == "none")
    return next(new ErrorResponse(`You are already logged out`, 401));

  // Decode token and find user
  // Verify token
  const decode = jwt.verify(token, process.env.JWT_SECRET);
  // Get User info from db and assign it to req always available
  try {
    req.user = await Users.findByPk(decode.id);
    // Clear token in cookies
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: `${req.user.username} has been logged out successfully`
    });

    // Delete Permissions from Redis
    redis.del(req.user.id, () => {
      console.log("User deleted from Redis".red);
    });
  } catch (error) {
    // Clear token in cookies
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    return next(new ErrorResponse("User is already logged out", 401));
  }
});
