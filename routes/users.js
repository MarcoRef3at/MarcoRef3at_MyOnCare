const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  updateUserPermissions,
  updateMe
} = require("../controllers/users/index");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  authorizedPermissions
} = require("../middleware/authorizedPermissions");

const advancedResults = require("../middleware/advancedResults");
const sequelize = require("../sequelize");
const { permissionsInclude } = require("../controllers/users/_functions");
const { Users } = sequelize.models;

router
  .route("/")
  .get(
    protect,
    authorizedPermissions("getUsers"),
    advancedResults(Users, "permissions", permissionsInclude),
    getUsers
  )
  .post(protect, authorizedPermissions("addUser"), addUser);

router.route("/me").put(protect, updateMe);

router
  .route("/:id")
  .get(protect, authorizedPermissions("getUser"), getUser)
  .put(protect, authorizedPermissions("updateUser"), updateUser)
  .delete(protect, authorizedPermissions("deleteUser"), deleteUser);
router
  .route("/:id/permissions")
  .put(
    protect,
    authorizedPermissions("updateUserPermissions"),
    updateUserPermissions
  );

module.exports = router;
