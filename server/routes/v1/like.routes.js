const express = require("express");
const router = express.Router();

// ======================================================================
//               🔐 Authentication Middleware
// ======================================================================
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { createLike } = require("@/controllers/like.controller");
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");

// ======================================================================
//                      ❤️ Like Routes
// ======================================================================
/*
* Create a new like for a comment or article
*/
router.post("/", verifyJWT, genericLimiter, createLike);

module.exports = router;
