const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const sequelize = require("../../sequelize");
const Redis = require("../../config/redis");

const { Users } = sequelize.models;

/* @des         **Delete a User**
                 1-Check if requested User Id is found in database
                2-Check If requested User Id is not for a Super Admin to protect super admin from deleting
                3-Check if the requested Id is not equal the requesting user's Id to protect from self delete
                4-If all ok remove user and respond with the number of rows affected by this delete
    */
// @route       DELETE /api/v2/users/:id
// @access      Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
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
    //2- Check that it's role is not "SuperAdmin"
    // To Protect Super Admin from deleting
    if (uzer.role == "superAdmin") {
      return next(new ErrorResponse("Super Admin is Undeletable", 401));
      // 3-Check If Target user id is the same of the requesting user Id to protect the user from self delete
    } else if (req.params.id == req.user.id) {
      return next(new ErrorResponse("You Cannot delete yourself", 401));
    }
  }

  // Delete User From Database
  let rows = await Users.destroy({ where: { id: req.params.id } });
  // Delete User from Redis if loggedin
  Redis.del(req.params.id);

  res.status(200).json({
    success: true,
    data: `${rows} ${rows > 1 ? "users" : "user"} successfully deleted`
  });
});
