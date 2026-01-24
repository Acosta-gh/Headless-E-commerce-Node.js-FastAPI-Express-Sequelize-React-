const express = require("express");
const router = express.Router();

// ======================================================================
//                        🧑 User Model
// ======================================================================
const { User } = require("@/models/index");

// ======================================================================
//                      🧑 User Controllers
// ======================================================================
const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
} = require("@/controllers/user.controller");

// ======================================================================
//            🔐 Authentication & Authorization Middlewares
// ======================================================================
const { authorizeOwner } = require("@/middlewares/authorizeOwner.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");

// ======================================================================
//                      🧑 User Routes
// ======================================================================

// Get all users (admin only)
router.get("/", verifyJWT, isAdmin, getAllUsers);

// Get a specific user by ID (owner only)
router.get(
  "/:id",
  verifyJWT,
  genericLimiter,
  authorizeOwner(async (req) => User.findByPk(req.params.id)),
  getUserById
);

// Update a specific user by ID (owner only, admin can update more fields)
router.put(
  "/:id",
  verifyJWT,
  authorizeOwner(async (req) => User.findByPk(req.params.id), true),
  updateUser
);

// Delete a specific user by ID (owner only)
router.delete(
  "/:id",
  verifyJWT,
  authorizeOwner(async (req) => User.findByPk(req.params.id)),
  deleteUser
);

module.exports = router;