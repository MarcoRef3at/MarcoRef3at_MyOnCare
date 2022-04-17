const db_initial = require("./db_initial");
const mysql = require("mysql2/promise");
const sequelize = require("../sequelize");

const connectDB = async () => {
  console.log(`Checking database connection...`);
  try {
    await sequelizeSync();
  } catch (error) {
    if (
      error.parent.sqlMessage &&
      error.parent.sqlMessage.startsWith("Unknown database")
    ) {
      try {
        // Create DB IF not exist
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD
        });
        await connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`
        );

        await sequelizeSync();

        // Set Database initial Values from json files in _data folder
        await db_initial();
      } catch (error) {
        console.log(
          `Unable to Create ${sequelize.options.dialect} Database @ ${sequelize.options.host}:${sequelize.options.port}`
            .bgRed.white.bold
        );
        process.exit(1);
      }
    } else {
      console.log(
        `Unable to connect to ${sequelize.options.dialect} Database @ ${sequelize.options.host}:${sequelize.options.port}`
          .bgRed.white.bold
      );
      process.exit(1);
    }
  }
};
module.exports = connectDB;

const sequelizeSync = async () => {
  await sequelize.sync({
    // Drop Table on every restart
    force: JSON.parse(process.env.DROP_DB),
    alter: true
  });

  if (JSON.parse(process.env.DROP_DB)) {
    console.log("Sequelize DropAll:".bgGreen.bold, "OK");
    // Set Database initial Values from json files in _data folder
    await db_initial();
  }

  console.log(
    `Connected to ${sequelize.options.dialect} Database @ ${sequelize.options.host}:${sequelize.options.port} `
      .bgYellow.black.bold
  );
};
