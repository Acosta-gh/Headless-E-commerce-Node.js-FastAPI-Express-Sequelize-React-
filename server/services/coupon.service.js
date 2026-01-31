// services/coupon.service.js
const { Coupon, CouponUsage, Order, User } = require("@/models");
const { Op } = require("sequelize");

/**
 * 🎫 Validate and calculate coupon discount
 * @param {string} couponCode - Coupon code to validate
 * @param {number} userId - User ID
 * @param {Array} validatedItems - Array of validated order items
 * @param {number} subtotal - Order subtotal before coupon
 * @param {number} shippingCost - Shipping cost
 * @param {Object} transaction - Sequelize transaction
 * @returns {Object} { coupon, discountAmount, freeShipping }
 */
const validateAndApplyCoupon = async (
    couponCode,
    userId,
    validatedItems,
    subtotal,
    shippingCost,
    transaction
) => {
    if (!couponCode) {
        return { coupon: null, discountAmount: 0, freeShipping: false };
    }

    // =====================
    // 1. Fetch coupon
    // =====================
    const coupon = await Coupon.findOne({
        where: {
            code: couponCode.toUpperCase().trim(),
            isActive: true,
        },
        transaction,
    });

    if (!coupon) {
        throw new Error(`Coupon "${couponCode}" not found or is inactive`);
    }

    // =====================
    // 2. Check validity dates
    // =====================
    const now = new Date();

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
        throw new Error(`Coupon "${couponCode}" is not yet valid. Valid from: ${coupon.startsAt}`);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        throw new Error(`Coupon "${couponCode}" has expired on ${coupon.expiresAt}`);
    }

    // =====================
    // 3. Check usage limits
    // =====================
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error(`Coupon "${couponCode}" has reached its usage limit`);
    }

    // =====================
    // 4. Check per-user usage limit
    // =====================
    if (coupon.usagePerUser) {
        const userUsageCount = await CouponUsage.count({
            where: {
                couponId: coupon.id,
                userId: userId,
            },
            transaction,
        });

        if (userUsageCount >= coupon.usagePerUser) {
            throw new Error(
                `You have already used coupon "${couponCode}" the maximum number of times (${coupon.usagePerUser})`
            );
        }
    }

    // =====================
    // 5. Check user restrictions
    // =====================
    if (coupon.specificUsers && Array.isArray(coupon.specificUsers)) {
        if (!coupon.specificUsers.includes(userId)) {
            throw new Error(`Coupon "${couponCode}" is not available for your account`);
        }
    }

    // =====================
    // 6. Check if user is new (if required)
    // =====================
    if (coupon.newUsersOnly) {
        const previousOrders = await Order.count({
            where: {
                userId: userId,
                orderStatus: { [Op.ne]: 'cancelled' },
            },
            transaction,
        });

        if (previousOrders > 0) {
            throw new Error(`Coupon "${couponCode}" is only for new customers`);
        }
    }

    // =====================
    // 7. Check minimum order amount
    // =====================
    if (coupon.minOrderAmount && subtotal < parseFloat(coupon.minOrderAmount)) {
        throw new Error(
            `Coupon "${couponCode}" requires a minimum order of $${coupon.minOrderAmount}. Current subtotal: $${subtotal.toFixed(2)}`
        );
    }

    // =====================
    // 8. Check product restrictions
    // =====================
    const applicableItems = validatedItems.filter((item) => {
        // Check if product is excluded
        if (coupon.excludedProducts && Array.isArray(coupon.excludedProducts)) {
            if (coupon.excludedProducts.includes(item.productId)) {
                return false;
            }
        }

        // Check if coupon applies to specific products
        if (coupon.appliesToProducts && Array.isArray(coupon.appliesToProducts)) {
            return coupon.appliesToProducts.includes(item.productId);
        }

        // If no specific products, applies to all (except excluded)
        return true;
    });

    if (applicableItems.length === 0) {
        throw new Error(`Coupon "${couponCode}" does not apply to any items in your cart`);
    }

    // =====================
    // 9. Calculate discount
    // =====================
    let discountAmount = 0;
    let freeShipping = false;

    if (coupon.discountType === "free_shipping") {
        freeShipping = true;
        discountAmount = 0; // Shipping will be set to 0 in createOrder
    } else {
        // Calculate subtotal of applicable items only
        const applicableSubtotal = applicableItems.reduce((sum, item) => {
            return sum + (item.unitPrice * item.quantity);
        }, 0);

        if (coupon.discountType === "percentage") {
            discountAmount = (applicableSubtotal * parseFloat(coupon.discountValue)) / 100;

            // Apply max discount cap if set
            if (coupon.maxDiscountAmount && discountAmount > parseFloat(coupon.maxDiscountAmount)) {
                discountAmount = parseFloat(coupon.maxDiscountAmount);
            }
        } else if (coupon.discountType === "fixed") {
            discountAmount = parseFloat(coupon.discountValue);

            // Discount cannot exceed applicable subtotal
            if (discountAmount > applicableSubtotal) {
                discountAmount = applicableSubtotal;
            }
        }
    }

    // Update item discounts for applicable items
    if (discountAmount > 0 && coupon.discountType !== "free_shipping") {
        const applicableSubtotal = applicableItems.reduce((sum, item) => {
            return sum + (item.unitPrice * item.quantity);
        }, 0);

        // Distribute discount proportionally across applicable items
        applicableItems.forEach((item) => {
            const itemSubtotal = item.unitPrice * item.quantity;
            const itemProportion = itemSubtotal / applicableSubtotal;
            item.discount = Math.round(discountAmount * itemProportion * 100) / 100;
        });
    }

    console.log("🎫 Coupon applied:");
    console.log("   Code:", couponCode);
    console.log("   Type:", coupon.discountType);
    console.log("   Discount:", discountAmount.toFixed(2));
    console.log("   Free shipping:", freeShipping);

    return {
        coupon,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        freeShipping,
    };
};

/**
 * 🎫 Record coupon usage
 */
const recordCouponUsage = async (couponId, userId, orderId, discountAmount, transaction) => {
    // Create usage record
    await CouponUsage.create(
        {
            couponId,
            userId,
            orderId,
            discountAmount,
        },
        { transaction }
    );

    // Increment used count
    await Coupon.increment('usedCount', {
        by: 1,
        where: { id: couponId },
        transaction,
    });

    console.log("✅ Coupon usage recorded");
};

/**
 * 📋 Get all coupons (admin)
 */
const getAllCoupons = async (filters = {}) => {
    const where = {};

    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    if (filters.discountType) {
        where.discountType = filters.discountType;
    }

    const coupons = await Coupon.findAll({
        where,
        include: [
            {
                model: CouponUsage,
                as: 'usages',
                attributes: ['id', 'userId', 'orderId', 'discountAmount', 'usedAt'],
            }
        ],
        order: [['createdAt', 'DESC']],
    });

    return coupons;
};

/**
 * 🔍 Get coupon by ID
 */
const getCouponById = async (id) => {
    const coupon = await Coupon.findByPk(id, {
        include: [
            {
                model: CouponUsage,
                as: 'usages',
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'email'],
                    },
                    {
                        model: Order,
                        as: 'order',
                        attributes: ['id', 'orderNumber', 'totalAmount', 'createdAt'],
                    }
                ],
            }
        ],
    });

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    return coupon;
};

/**
 * 🔍 Get coupon by code
 */
const getCouponByCode = async (code) => {
    const coupon = await Coupon.findOne({
        where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
        throw new Error(`Coupon "${code}" not found`);
    }

    return coupon;
};

/**
 * ➕ Create new coupon
 */
const createCoupon = async (data) => {
    // Validate required fields
    if (!data.code || !data.discountType) {
        throw new Error("Code and discountType are required");
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({
        where: { code: data.code.toUpperCase().trim() }
    });

    if (existingCoupon) {
        throw new Error(`Coupon code "${data.code}" already exists`);
    }

    // Create coupon
    const coupon = await Coupon.create({
        ...data,
        code: data.code.toUpperCase().trim(),
    });

    console.log(`✅ Coupon created: ${coupon.code}`);
    return coupon;
};

/**
 * ✏️ Update coupon
 */
const updateCoupon = async (id, data) => {
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    // If code is being changed, check it doesn't exist
    if (data.code && data.code.toUpperCase().trim() !== coupon.code) {
        const existingCoupon = await Coupon.findOne({
            where: { code: data.code.toUpperCase().trim() }
        });

        if (existingCoupon) {
            throw new Error(`Coupon code "${data.code}" already exists`);
        }
    }

    // Update coupon
    await coupon.update({
        ...data,
        code: data.code ? data.code.toUpperCase().trim() : coupon.code,
    });

    console.log(`✅ Coupon updated: ${coupon.code}`);
    return coupon;
};

/**
 * 🗑️ Delete coupon
 */
const deleteCoupon = async (id) => {
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    // Check if coupon has been used
    const usageCount = await CouponUsage.count({
        where: { couponId: id }
    });

    if (usageCount > 0) {
        throw new Error(`Cannot delete coupon "${coupon.code}" - it has been used ${usageCount} times. Consider deactivating it instead.`);
    }

    await coupon.destroy();
    console.log(`🗑️ Coupon deleted: ${coupon.code}`);
    return true;
};

/**
 * 🔄 Toggle coupon active status
 */
const toggleCouponStatus = async (id) => {
    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    await coupon.update({ isActive: !coupon.isActive });

    console.log(`🔄 Coupon ${coupon.code} ${coupon.isActive ? 'activated' : 'deactivated'}`);
    return coupon;
};

/**
 * 📊 Get coupon statistics
 */
const getCouponStats = async (id) => {
    const coupon = await Coupon.findByPk(id, {
        include: [
            {
                model: CouponUsage,
                as: 'usages',
                attributes: ['discountAmount', 'usedAt'],
            }
        ],
    });

    if (!coupon) {
        throw new Error("Coupon not found");
    }

    const totalDiscount = coupon.usages.reduce((sum, usage) => {
        return sum + parseFloat(usage.discountAmount);
    }, 0);

    const stats = {
        code: coupon.code,
        totalUses: coupon.usedCount,
        usageLimit: coupon.usageLimit,
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : 'Unlimited',
        totalDiscountGiven: totalDiscount.toFixed(2),
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
    };

    return stats;
};

module.exports = {
    validateAndApplyCoupon,
    recordCouponUsage,
    getAllCoupons,
    getCouponById,
    getCouponByCode,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    getCouponStats,
};