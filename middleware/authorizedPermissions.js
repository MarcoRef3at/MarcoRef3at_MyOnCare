const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const redis = require("../config/redis");

/*
**Permissions authorization Check For Requests**

if User role is Super Admin , All Checks will passed

if User Role is other , we get the user's permissions from redis -as it is saved before while login- 
then we compare it with "allowedPermissions" array provided to the function in arguments if found then pass if not raise error
*/

// Grant access to specific permissions
exports.authorizedPermissions = (...allowedPermeissions) => {
  return asyncHandler(async (req, res, next) => {
    if (req.user.role !== "superAdmin") {
      // Find User Data in Redis by id
      redis.hgetall(req.user.id, function (err, obj) {
        if (obj) {
          userPermissions = JSON.parse(obj["All_Permissions"]);

          // Check if permession required is found in user's permissions in redis
          if (
            !allowedPermeissions.some(r => userPermissions.indexOf(r) !== -1)
          ) {
            return next(
              new ErrorResponse(
                `User ${req.user.id}-${req.user.username} is not authorized to access ${allowedPermeissions}`,
                401
              )
            );
          } else {
            // If permissions found
            next();
          }
        } else {
          // if User not found in redis
          return next(
            new ErrorResponse(
              `User ${req.user.id}-${req.user.username} is not authorized to access ${allowedPermeissions}`,
              401
            )
          );
        }
      });
    } else {
      // If SuperAdmin
      next();
    }
  });
};
