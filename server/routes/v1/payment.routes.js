const express = require("express");
const router = express.Router();
const {
  getAvailablePaymentMethods,
  getAllPaymentMethodsAdmin,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
} = require("@/controllers/payment.controller");

const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");

// =====================
// Public Routes
// =====================

/**
 * Get enabled payment methods (for checkout)
 * GET /api/v1/payment
 */
router.get("/", genericLimiter, getAvailablePaymentMethods);

// =====================
// Admin Routes
// =====================

/**
 * Get ALL payment methods including disabled (admin)
 * GET /api/v1/payment/admin/all
 */
router.get("/admin/all", verifyJWT, isAdmin, genericLimiter, getAllPaymentMethodsAdmin);

/**
 * Get payment method by ID (admin)
 * GET /api/v1/payment/admin/:id
 */
router.get("/admin/:id", verifyJWT, isAdmin, genericLimiter, getPaymentMethodById);

/**
 * Create payment method (admin)
 * POST /api/v1/payment/admin
 */
//router.post("/admin", verifyJWT, isAdmin, genericLimiter, createPaymentMethod);

/**
 * Update payment method (admin)
 * PATCH /api/v1/payment/admin/:id
 */
router.patch("/admin/:id", verifyJWT, isAdmin, genericLimiter, updatePaymentMethod);

/**
 * Toggle payment method enabled/disabled (admin)
 * PATCH /api/v1/payment/admin/:id/toggle
 */
router.patch("/admin/:id/toggle", verifyJWT, isAdmin, genericLimiter, togglePaymentMethodStatus);

/**
 * Delete payment method (admin)
 * DELETE /api/v1/payment/admin/:id
 */
//router.delete("/admin/:id", verifyJWT, isAdmin, genericLimiter, deletePaymentMethod);

module.exports = router;
