const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../../config/redis");

// Generate logged in user token by user id
const getSignedJwtToken = user => {
  // Initiate payload
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
// Generate token, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = getSignedJwtToken(user);

  // Cookies option
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    )
    //httpOnly: true
  };

  // Send Cookies over HTTPS
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  const All_Permissions = user.All_Permissions || [];
  redis.hmset(
    user.id,
    "All_Permissions",
    JSON.stringify(All_Permissions),
    "isActive",
    user.isActive
  );

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
    All_Permissions
  });
};
exports.sendTokenResponse = sendTokenResponse;
// Match Password entered with hashed one
const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
exports.matchPassword = matchPassword;
