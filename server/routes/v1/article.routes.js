const express = require("express");
const router = express.Router();

// ======================================================================
//                   📰 Article Model
// ======================================================================
const { Article } = require("@/models/index"); 

// ======================================================================
//                  📰 Article Controllers
// ======================================================================
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("@/controllers/article.controller");

// ======================================================================
//            📁 File Upload Middlewares
// ======================================================================
const {
  upload,
  multerErrorHandler,
} = require("@/middlewares/upload.middleware");

// ======================================================================
//            🔐 Authentication & Authorization Middlewares
// ======================================================================
const { verifyTempIdToken } = require("@/middlewares/tempid.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { authorizeOwner } = require("@/middlewares/authorizeOwner.middleware");


// ======================================================================
//                      📰 Article Routes
// ======================================================================
// Create a new article
router.post(
  "/",
  verifyJWT,
  isAdmin,
  upload.single("banner"),
  multerErrorHandler,
  verifyTempIdToken,
  createArticle
);

// Get all articles
router.get("/", getAllArticles);

// Get a specific article by ID
router.get("/:id", getArticleById);

// Update a specific article by ID
router.put(
  "/:id",
  verifyJWT,
  authorizeOwner(async (req) => Article.findByPk(req.params.id), true),
  upload.single("banner"),
  multerErrorHandler,
  verifyTempIdToken,
  updateArticle
);

// Delete a specific article by ID
router.delete(
  "/:id",
  verifyJWT,
  authorizeOwner(async (req) => Article.findByPk(req.params.id), true),
  deleteArticle
);

module.exports = router;
