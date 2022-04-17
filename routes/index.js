const users = require("./users");
const auth = require("./auth");
const permissions = require("./permissions");

const routers = app => {
  app.use("/api/v2/auth", auth);
  app.use("/api/v2/users", users);
  app.use("/api/v2/permissions", permissions);
};

module.exports = routers;
