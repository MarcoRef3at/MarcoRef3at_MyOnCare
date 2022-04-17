const sequelize = require("../../sequelize");
const { Users, Permissions } = sequelize.models;
const _USERS = require("./../../_data/_users.json");

const usersInit = async () => {
  Users.bulkCreate(_USERS, {
    validate: true,
    individualHooks: true,
  })
    .then(async (user) => {
      const count = await Users.count();
      const permissionsCount = await Permissions.count();
      let permissionsIds = Array.from(
        { length: permissionsCount },
        (v, k) => k + 1
      );

      user[0].setAll_Permissions(permissionsIds);
      user[1].setAll_Permissions(permissionsIds);
      console.log("Users Created:".bgYellow.black.bold, count);
    })
    .catch((e) => {
      // console.log("Add Users error:", e)
    });
};
module.exports = usersInit;
