const express = require("express");
const router = express.Router();

// ======================================================================
//                   🆔 Temp ID Controllers
// ======================================================================
const { createTempId } = require("@/controllers/tempid.controller");

// ======================================================================
//            🔐 Authentication & Authorization Middlewares
// ======================================================================
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");

// ======================================================================
//                      🆔 Temp ID Routes
// ======================================================================
// Create a new temp ID
router.get("/", verifyJWT, isAdmin, createTempId);

module.exports = router;
