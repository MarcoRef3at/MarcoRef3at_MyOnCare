const express = require("express");
const {
  getPermission,
  getPermissions,
  getRolePermissions,
  updatePermission,
  deletePermission,
  addPermission,
  bulkCreate,
  deleteAllPermissions,
  getUserAvailablePermissions
} = require("../controllers/permissions");
const router = express.Router();

const { protect } = require("../middleware/auth");

router
  .route("/")
  .get(protect, getPermissions)
  .post(protect, addPermission)
  .copy(bulkCreate);

router.route("/all").delete(deleteAllPermissions);

router
  .route("/:id")
  .get(getPermission)
  .put(protect, updatePermission)
  .delete(protect, deletePermission);

router.route("/role/:role").get(getRolePermissions);
router.route("/user/:id").get(protect, getUserAvailablePermissions);

module.exports = router;
