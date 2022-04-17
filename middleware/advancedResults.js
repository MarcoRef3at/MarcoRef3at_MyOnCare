const ErrorResponse = require("../utils/errorResponse");
const { Op } = require("sequelize");

const execludeAttribute = {
  attributes: {
    exclude: [
      "password",
      "createdAt",
      "updatedAt",
      "resetPasswordToken",
      "resetPasswordExpire"
    ]
  }
};

const advancedResults =
  (model, association, includes) => async (req, res, next) => {
    let reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    // Get All Users from Database

    let query = {
      ...execludeAttribute,
      ...includes
    };

    // Select Fields
    if (req.query.select) {
      let attributes = req.query.select.split(",");

      // For Select including Permissions
      if (attributes.includes(association)) {
        attributes = attributes.filter(e => e !== association);
        query = { attributes, ...includes };
      } else {
        query = { attributes };
      }
    }

    // Where
    let includedWhereQuery = {};
    for (param in reqQuery) {
      if (param.includes(".")) {
        let newparam = param.split(".");
        // If Found underscore_ replace it with %
        reqQuery[param] = reqQuery[param].replace(/\_/g, "%");
        // add [Op] before the key
        try {
          reqQuery[newparam[0]] = {
            [Op[newparam[1]]]: JSON.parse(reqQuery[param])
          };
        } catch (error) {
          return next(new ErrorResponse("Query has invalid parameters", 403));
        }
        // Delete old parameter
        delete reqQuery[param];
      } else if (param == "violationTypeId") {
        includedWhereQuery["violationTypeId"] = JSON.parse(reqQuery[param]);
        delete reqQuery[param];
      }
    }
    query.where = reqQuery;

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",");

      let order = [];
      await Promise.all(
        sortBy.map(sorter => {
          return sorter.startsWith("-")
            ? order.push([sorter.substring(1), "DESC"])
            : order.push([sorter, "ASC"]);
        })
      );
      query.order = order;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.count();
    query.offset = startIndex;
    query.limit = limit;

    // Pagination Result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        pages: Math.ceil(total / limit),
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.previous = {
        pages: Math.ceil(total / limit),
        page: page - 1,
        limit
      };
    }

    // Execute Query
    try {
      let allResults = await model.findAll();
      let results = await model.findAll(query);
      res.advancedResults = {
        success: true,
        allCount: allResults.length,
        count: results.length,
        pagination,
        data: results
      };
      next();
    } catch (error) {
      return next(new ErrorResponse(error, 404));
    }
  };

module.exports = advancedResults;
