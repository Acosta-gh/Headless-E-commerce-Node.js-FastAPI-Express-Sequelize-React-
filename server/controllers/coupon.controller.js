// controllers/coupon.controller.js
const CouponService = require("@/services/coupon.service");

/**
 * 📋 Get all coupons (Admin only)
 */
const getAllCoupons = async (req, res) => {
  try {
    const filters = {
      isActive: req.query.isActive,
      discountType: req.query.discountType,
    };

    const coupons = await CouponService.getAllCoupons(filters);
    return res.status(200).json(coupons);
  } catch (error) {
    console.error("Get all coupons error:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 🔍 Get coupon by ID (Admin only)
 */
const getCouponById = async (req, res) => {
  try {
    const coupon = await CouponService.getCouponById(req.params.id);
    return res.status(200).json(coupon);
  } catch (error) {
    console.error("Get coupon by ID error:", error);
    if (error.message === "Coupon not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 🔍 Validate coupon code (Public - for users to check before checkout)
 */
const validateCouponCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await CouponService.getCouponByCode(code);

    // Return safe info (don't expose internal details)
    const safeInfo = {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
    };

    return res.status(200).json(safeInfo);
  } catch (error) {
    console.error("Validate coupon code error:", error);
    return res.status(404).json({ error: error.message });
  }
};

/**
 * ➕ Create new coupon (Admin only)
 */
const createCoupon = async (req, res) => {
  try {
    const coupon = await CouponService.createCoupon(req.body);
    return res.status(201).json(coupon);
  } catch (error) {
    console.error("Create coupon error:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * ✏️ Update coupon (Admin only)
 */
const updateCoupon = async (req, res) => {
  try {
    const coupon = await CouponService.updateCoupon(req.params.id, req.body);
    return res.status(200).json(coupon);
  } catch (error) {
    console.error("Update coupon error:", error);
    if (error.message === "Coupon not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 🗑️ Delete coupon (Admin only)
 */
const deleteCoupon = async (req, res) => {
  try {
    await CouponService.deleteCoupon(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error("Delete coupon error:", error);
    if (error.message === "Coupon not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("has been used")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 🔄 Toggle coupon active status (Admin only)
 */
const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await CouponService.toggleCouponStatus(req.params.id);
    return res.status(200).json(coupon);
  } catch (error) {
    console.error("Toggle coupon status error:", error);
    if (error.message === "Coupon not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 📊 Get coupon statistics (Admin only)
 */
const getCouponStats = async (req, res) => {
  try {
    const stats = await CouponService.getCouponStats(req.params.id);
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Get coupon stats error:", error);
    if (error.message === "Coupon not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCoupons,
  getCouponById,
  validateCouponCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats,
};