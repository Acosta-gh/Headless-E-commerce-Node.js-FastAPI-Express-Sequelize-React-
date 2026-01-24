const express = require("express");
const router = express.Router();

// ======================================================================
//                      🔐 Auth Controllers
// ======================================================================
const {
  registerUser,
  loginUser,
  sendResetPasswordEmail,
  resetPassword
} = require("@/controllers/auth.controller");

// ======================================================================
//                      🔐 Auth Routes
// ======================================================================

// Register a new user
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Send reset password email
router.post("/forgot-password", sendResetPasswordEmail);

// Reset password with a token
router.post("/reset-password", resetPassword);

    
module.exports = router;