const ErrorResponse = require("../utils/errorResponse");
const getRoles = require("../utils/getRoles");

const errorHandler = async (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log("err".bgRed, err.message);

  // Sequelize Duplicated Field
  if (err.parent) {
    if (err.parent.code === "ER_DUP_ENTRY") {
      const message = err.parent.sqlMessage;
      error = new ErrorResponse(message, 400);
    }

    // If User Role is not included in Roles Table
    if (
      err.parent.code === "ER_NO_REFERENCED_ROW_2" &&
      err.fields.includes("role")
    ) {
      const roles = await getRoles();
      const message = `User Role (${err.value}) is not valid, User Role must be included in [${roles}] `;
      error = new ErrorResponse(message, 404);
    }
  }

  //   Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error"
  });
};

module.exports = errorHandler;
