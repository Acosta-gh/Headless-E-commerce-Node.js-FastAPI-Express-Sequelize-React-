const express = require('express');
const router = express.Router();
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");

const {
  getAvailableShippingMethods,
  calculateShippingCost,
  validateShippingMethod,
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  toggleShippingMethodStatus,
  deleteShippingMethod,
  disableShippingMethod
} = require('@/controllers/shipping.controller');

// =====================
// Public Routes
// =====================

/**
 * Get available shipping methods for checkout
 * POST /api/v1/shipping/calculate
 * Body: { shippingAddress, cartSubtotal, cartWeight }
 */
router.post(
  '/calculate',
  genericLimiter,
  getAvailableShippingMethods
);

/**
 * Calculate cost for specific shipping method
 * POST /api/v1/shipping/calculate/:methodId
 * Body: { shippingAddress, orderSubtotal, orderWeight }
 */
router.post(
  '/calculate/:methodId',
  genericLimiter,
  calculateShippingCost
);

/**
 * Validate if shipping method is available
 * POST /api/v1/shipping/validate/:methodId
 * Body: { shippingAddress, orderSubtotal, orderWeight }
 */
router.post(
  '/validate/:methodId',
  genericLimiter,
  validateShippingMethod
);

// =====================
// Admin Routes
// =====================

/**
 * Get all shipping methods (with disabled ones)
 * GET /api/v1/shipping/admin/all
 */
router.get(
  '/admin/all',
  verifyJWT,
  isAdmin,
  genericLimiter,
  getAllShippingMethods
);

/**
 * Get shipping method by ID
 * GET /api/v1/shipping/admin/:id
 */
router.get(
  '/admin/:id',
  verifyJWT,
  isAdmin,
  genericLimiter,
  getShippingMethodById
);

/**
 * Create new shipping method
 * POST /api/v1/shipping/admin
 * Body: { code, name, baseCost, ... }
 */
router.post(
  '/admin',
  verifyJWT,
  isAdmin,
  genericLimiter,
  createShippingMethod
);

/**
 * Update shipping method
 * PATCH /api/v1/shipping/admin/:id
 * Body: { name, baseCost, enabled, ... }
 */
router.patch(
  '/admin/:id',
  verifyJWT,
  isAdmin,
  genericLimiter,
  updateShippingMethod
);

/**
 * Toggle shipping method status (enable/disable)
 * PATCH /api/v1/shipping/admin/:id/toggle
 */
router.patch(
  '/admin/:id/toggle',
  verifyJWT,
  isAdmin,
  genericLimiter,
  toggleShippingMethodStatus
);

/**
 * Delete shipping method
 * DELETE /api/v1/shipping/admin/:id
 */
router.delete(
  '/admin/:id',
  verifyJWT,
  isAdmin,
  genericLimiter,
  deleteShippingMethod
);

module.exports = router;