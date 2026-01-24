const express = require("express");
const router = express.Router();

// ======================================================================
//                   🗂️ Category Controllers
// ======================================================================
const {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} = require("@/controllers/category.controller");

// ======================================================================
//               🔐 Authentication & Authorization Middlewares
// ======================================================================
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");

// ======================================================================
//                      🗂️ Category Routes
// ======================================================================
/*
* Create a new category
*/
router.post("/", verifyJWT, isAdmin, createCategory);
/*
* Delete a specific category by ID
*/
router.delete("/:id", verifyJWT, isAdmin, deleteCategory);
/*
* Update a specific category by ID
*/
router.put("/:id", verifyJWT, isAdmin, updateCategory);
/*
* Get all categories
*/
router.get("/", getAllCategories);
/*
* Get a specific category by ID
*/
router.get("/:id", getCategoryById);

module.exports = router;
