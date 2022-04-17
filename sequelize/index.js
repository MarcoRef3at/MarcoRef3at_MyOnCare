const { Sequelize } = require("sequelize");
const { applyExtraSetup } = require("./extra-setup");
// Load env vars
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    operatorAliases: false,
    define: {
      freezeTableName: false
    },
    logging: false
  }
);

const modelDefiners = [
  require("../models/Users.model"),
  require("../models/UserRoles.model"),
  require("../models/Permissions.model")
];

//define all models according to their files.
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;
