const express = require("express");
const router = express.Router();

// ======================================================================
//                   🕑 Rate Limiting Middleware
// ======================================================================
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");

// ======================================================================
//                       🗨️ Comment Model
// ======================================================================
const { Comment } = require("@/models/index");

// ======================================================================
//                      📝 Comment Controllers
// ======================================================================
const {
  createComment,
  deleteComment,
  getCommentById,
  getAllCommentsByArticleId,
} = require("@/controllers/comment.controller");

// ======================================================================
//            🔐 Authentication & Authorization Middlewares
// ======================================================================
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { authorizeOwner } = require("@/middlewares/authorizeOwner.middleware");

// ======================================================================
//                      🗨️ Comment Routes
// ======================================================================
/*
 * Create a new comment
 */
router.post("/", verifyJWT, genericLimiter, createComment);
/*
 * Get all comments for a specific article by articleId
 */
router.get("/", getAllCommentsByArticleId);
/*
 * Get a specific comment by ID
 */
router.get("/:id", getCommentById);
/*
 * Delete a specific comment by ID
 */
router.delete(
  "/:id",
  verifyJWT,
  authorizeOwner(async (req) => Comment.findByPk(req.params.id), true),
  deleteComment
);
module.exports = router;
