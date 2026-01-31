const express = require("express");
const router = express.Router();

const CouponController = require("@/controllers/coupon.controller");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");

// =====================
// Public Routes
// =====================

/**
 * @route   GET /api/coupons/validate/:code
 * @desc    Validate a coupon code (users can check before checkout)
 * @access  Public
 */
router.get("/validate/:code", CouponController.validateCouponCode);

// =====================
// Admin Routes
// =====================

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons
 * @access  Admin only
 * @query   ?isActive=true&discountType=percentage
 */
router.get("/", verifyJWT, isAdmin, CouponController.getAllCoupons);

/**
 * @route   GET /api/coupons/:id
 * @desc    Get coupon by ID
 * @access  Admin only
 */
router.get("/:id", verifyJWT, isAdmin, CouponController.getCouponById);

/**
 * @route   POST /api/coupons
 * @desc    Create new coupon
 * @access  Admin only
 */
router.post("/", verifyJWT, isAdmin, CouponController.createCoupon);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update coupon
 * @access  Admin only
 */
router.put("/:id", verifyJWT, isAdmin, CouponController.updateCoupon);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Delete coupon
 * @access  Admin only
 */
router.delete("/:id", verifyJWT, isAdmin, CouponController.deleteCoupon);

/**
 * @route   PATCH /api/coupons/:id/toggle
 * @desc    Toggle coupon active status
 * @access  Admin only
 */
router.patch("/:id/toggle", verifyJWT, isAdmin, CouponController.toggleCouponStatus);

/**
 * @route   GET /api/coupons/:id/stats
 * @desc    Get coupon statistics
 * @access  Admin only
 */
router.get("/:id/stats", verifyJWT, isAdmin, CouponController.getCouponStats);

module.exports = router;