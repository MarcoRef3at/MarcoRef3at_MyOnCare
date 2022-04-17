const redis = require("../config/redis");

const getMyPermissions = async (loggedInUser) => {
  return new Promise((res, rej) => {
    redis.hgetall(loggedInUser.id, (err, usr) => {
      if (usr) {
        res(JSON.parse(usr.All_Permissions));
      }
    });
  });
};
module.exports = getMyPermissions;
