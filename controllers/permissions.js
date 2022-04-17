const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const dataInit = require("../config/db_initial/dataInit");
const sequelize = require("../sequelize");
const getRolePermissions = require("../utils/getRolePermissions");
const { filterPermissions } = require("./users/_functions");

const { Users, Permissions } = sequelize.models;

// @des         Get All permissions
// @route       GET /api/v2/permissions
// @access      Private/Admin
exports.getPermissions = asyncHandler(async (req, res, next) => {
  Permissions.findAll({ where: { permissionType: req.user.role } }).then(
    permission => {
      res.status(200).json({ success: true, data: permission });
    }
  );
});

// @des         Get All role's available permissions
// @route       GET /api/v2/permissions/:role
// @access      Private/Admin
exports.getRolePermissions = asyncHandler(async (req, res, next) => {
  getRolePermissions(req.params.role)
    .then(permission => {
      res.status(200).json({ success: true, data: permission });
    })
    .catch(() =>
      next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404))
    );
});

exports.getUserAvailablePermissions = asyncHandler(async (req, res, next) => {
  try {
    let user = await Users.findByPk(req.params.id);
    // Get Available Permission Names by getting intersection between logged in user and new created user

    let permissions = await filterPermissions(user.role, req.user);

    await Promise.all(
      // Retrieve every permission details from it's name
      permissions.map(async (permissionName, index) => {
        let targetPermission = await Permissions.findAll({
          where: { name: permissionName }
        });

        return (permissions[index] = targetPermission[0].dataValues);
      })
    );
    console.log("permissions:", permissions);
    res.status(200).json({ success: true, data: permissions });
  } catch (e) {
    console.log("e:", e);
    next(new ErrorResponse(`User with ID ${req.params.id} not found`, 404));
  }
});

// @des         Get Single permission
// @route       GET /api/v2/permission/:id
// @access      Private/Admin
exports.getPermission = asyncHandler(async (req, res, next) => {
  const permission = await Permissions.findByPk(req.params.id);
  if (!permission) {
    return next(
      new ErrorResponse(`Permission with ID ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ success: true, data: permission });
});

// @des         Create a permission
// @route       POST /api/v2/permission
// @access      Private/Admin
exports.addPermission = asyncHandler(async (req, res, next) => {
  const permission = await Permissions.create(req.body);
  res.status(201).json({ success: true, data: permission });
});

// @des         Update a permission
// @route       PUT /api/v2/permission/:id
// @access      Private/Admin
exports.updatePermission = asyncHandler(async (req, res, next) => {
  Permissions.update(req.body, { where: { id: req.params.id } })
    .then(result => {
      Permissions.findByPk(req.params.id).then(permission => {
        if (!permission) {
          return next(
            new ErrorResponse(
              `Permission with ID ${req.params.id} not found`,
              404
            )
          );
        } else {
          res.status(200).json({ success: true, data: permission });
        }
      });
    })
    .catch(e => {
      console.log("e:", e.message);
      return next(new ErrorResponse(e.message, 404));
    });
});

// @des         Delete a permission
// @route       DELETE /api/v2/permissions/:id
// @access      Private/Admin
exports.deletePermission = asyncHandler(async (req, res, next) => {
  Permissions.destroy({ where: { id: req.params.id } }).then(rows => {
    if (rows == 0) {
      return next(
        new ErrorResponse(`Permission with ID ${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: `${rows} ${
        rows > 1 ? "permissions" : "permission"
      } successfully deleted`
    });
  });
});

// @des         Bulk Create Permissions
// @route       COPY /api/v2/permission/
// @access      Private/Admin
exports.bulkCreate = asyncHandler(async (req, res, next) => {
  await dataInit(Permissions).then(() =>
    res.status(200).json({ success: true })
  );
});

// @des        Delete All Permissions
// @route       DELETE /api/v2/permission/all
// @access      Private/Admin
exports.deleteAllPermissions = asyncHandler(async (req, res, next) => {
  Permissions.sync({ force: true })
    .then(() => {
      res.status(200).json({ success: true, data: count });
    })
    .catch(e => res.status(400).json({ success: false, error: e }));
});
