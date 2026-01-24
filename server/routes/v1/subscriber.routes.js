const express = require("express");
const router = express.Router();

// ======================================================================
//                          🔐  Middleware
// ======================================================================
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");
const { createSubscriber } = require("@/controllers/subscriber.controller");

// ======================================================================
//                          🗞️ Subscriber Routes
// ======================================================================
router.post("/", genericLimiter, createSubscriber);

module.exports = router;
