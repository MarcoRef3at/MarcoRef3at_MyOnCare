const asyncHandler = require("../../middleware/async");

/* @des         **Get All Users**
                Get All Users from database
                then count them and
                responde with the users data and their count 
*/
// @route       GET /api/v2/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  // Responde with Count and Users Data using advancedResults Middleware
  res.status(200).json(res.advancedResults);
});
