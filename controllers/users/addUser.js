const asyncHandler = require("../../middleware/async");
const beautify = require("../../utils/beautifyAssociation");
const { filterPermissions } = require("./_functions");
const setDefaultPassword = require("../../utils/defaultPassword");
const sendEmail = require("../../utils/sendEmail");
const sequelize = require("../../sequelize");
const { Users, Permissions } = sequelize.models;

/* @des         **Create a New User**
                1-if Password is not provided in the post body,a default password is set from the username through a function
                2-Get Default Permissions that has to be set by default to the new User's Role and set them to him
                3-Get Common Permissions between new user's role and the creator user permissions then add them to the response to show the only avalialble permissions that can be granted to the new user
                4-Check For "sendEmail" Parameter in body to send Email to the new user with the credentials
*/
// @route       POST /api/v2/users
// @access      Private/Admin
exports.addUser = asyncHandler(async (req, res, next) => {
  // 1- Set default password from username if password is not provided
  if (!req.body.password)
    req.body.password = setDefaultPassword(req.body.username);

  // Create User in Databaase
  let user = await Users.create(req.body);

  /*2-Set User's Role Default Permissions*/
  // Get Default Permissions Available for the new User Role that has to be set by default
  let defaultPermissions = await Permissions.findAll({
    where: { permissionType: user.role, setByDefault: true }
  });

  // Modify the permissions array format to be readable IDs
  defaultPermissions = beautify(defaultPermissions, "id");

  // Set These Permissions to the user
  user.setAll_Permissions(defaultPermissions);

  //3- filter intersection between 2 arrays of permissions([New User Role's Permissions] and [Creator User Permissions])
  const availabePermissions = await filterPermissions(user.role, req.user);
  // 4-Check if Sending email is required
  if (req.body.sendEmail) {
    var emailSent = false;
    const message = `${process.env.NEW_ACCOUNT_EMAIL_BODY} \n\n Username:${user.username} \n\n Password:${req.body.password}`;

    try {
      await sendEmail({
        email: user.email,
        subject: process.env.NEW_ACCOUNT_SUBJECT,
        message
      });
      emailSent = true;
      next();
    } catch (error) {
      console.log("error:", error);
      emailSent = false;
      next();
    }
  }

  return res.status(201).json({
    success: true,
    data: user,
    availabePermissions,
    emailSent
  });
});
