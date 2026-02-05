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
} = require('@/controllers/shipping.controller');

// =====================
// Public Routes
// =====================

/**
 * Get available shipping methods for checkout
 * POST /api/v1/shipping/calculate
 * Body: { 
 *   shippingAddress: { city, state/province, postalCode, country },
 *   cartSubtotal: number,
 *   isBulky: boolean (optional)
 * }
 */
router.post(
  '/calculate',
  genericLimiter,
  getAvailableShippingMethods
);

/**
 * Calculate cost for specific shipping method
 * POST /api/v1/shipping/calculate/:methodId
 * Body: { 
 *   shippingAddress: { city, state/province, postalCode, country },
 *   orderSubtotal: number,
 *   isBulky: boolean (optional)
 * }
 */
router.post(
  '/calculate/:methodId',
  genericLimiter,
  calculateShippingCost
);

/**
 * Validate if shipping method is available
 * POST /api/v1/shipping/validate/:methodId
 * Body: { 
 *   shippingAddress: { city, state/province, postalCode, country },
 *   orderSubtotal: number,
 *   isBulky: boolean (optional)
 * }
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
 * Get all shipping methods (including disabled ones)
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
 * Body: {
 *   code: string (unique),
 *   name: string,
 *   description: string (optional),
 *   baseCost: number,
 *   enabled: boolean (default: true),
 *   displayOrder: number (optional),
 *   estimatedDaysMin: number (optional),
 *   estimatedDaysMax: number (optional),
 *   carrierName: string (optional),
 *   icon: string (optional),
 *   rules: {
 *     postalCodes: { "1000": { cost: 0 }, "5000": { cost: 600 } },
 *     provinces: { "Buenos Aires": { cost: 0 }, "Cordoba": { cost: 500 } },
 *     bulkyExtra: number (optional),
 *     freeShippingThreshold: number (optional)
 *   }
 * }
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
 * Body: Same as create (all fields optional)
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