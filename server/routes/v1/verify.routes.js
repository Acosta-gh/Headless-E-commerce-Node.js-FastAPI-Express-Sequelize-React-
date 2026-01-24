const express = require("express");
const router = express.Router();

// ======================================================================
//                   📧 Verify Controllers
// ======================================================================
const {
  verifyUserEmail,           // ✅ CORRECCIÓN: era "verifyEmail"
  verifySubscriberEmail,
  resendVerificationEmail,
} = require("@/controllers/verify.controller");

// ======================================================================
//            🔐 Rate Limiting Middlewares
// ======================================================================
const {
  verifyLimiter,
  resendLimiter,
} = require("@/middlewares/rateLimit.middleware");

// ======================================================================
//                      📧 Verify Routes
// ======================================================================

// Verify user email - GET /verify?token=xxx
router.get("/", verifyLimiter, verifyUserEmail);

// Verify subscriber email - GET /verify/subscriber?token=xxx
router.get("/subscriber", verifyLimiter, verifySubscriberEmail);

// Resend verification email - POST /verify/resend
router.post("/resend", resendLimiter, resendVerificationEmail);

module.exports = router;