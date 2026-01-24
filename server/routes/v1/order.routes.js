const express = require("express");
const router = express.Router();

// ======================================================================
//                          🔐  Middleware
// ======================================================================
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");

// ======================================================================
//                       Controllers
// ======================================================================
const {
  createOrder,
  getOrdersByUserId,
  updatePaymentStatus,
} = require("@/controllers/order.controller");

// ======================================================================
//                          🗞️ Order Routes
// ======================================================================
router.post("/", verifyJWT, genericLimiter, createOrder);
router.get("/", verifyJWT, genericLimiter, getOrdersByUserId);

// Endpoint interno para actualizar estado desde Python webhook
// No requiere JWT porque viene desde tu servicio de Python
router.patch("/:orderId/payment-status", updatePaymentStatus);

module.exports = router;