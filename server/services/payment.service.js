const { PaymentMethod, Order } = require("@/models");
const { Op } = require("sequelize");

/**
 * Get all enabled payment methods (public)
 */
const getAvailablePaymentMethods = async () => {
    try {
        const methods = await PaymentMethod.findAll({
            where: { enabled: true },
            order: [["displayOrder", "ASC"]],
        });
        return methods;
    } catch (error) {
        throw new Error(`Error getting payment methods: ${error.message}`);
    }
};

/**
 * Get ALL payment methods including disabled (admin)
 */
const getAllPaymentMethods = async () => {
    try {
        const methods = await PaymentMethod.findAll({
            order: [["displayOrder", "ASC"]],
        });
        return methods;
    } catch (error) {
        throw new Error(`Error getting all payment methods: ${error.message}`);
    }
};

/**
 * Get single payment method by ID
 */
const getPaymentMethodById = async (id) => {
    try {
        const method = await PaymentMethod.findByPk(id);
        return method;
    } catch (error) {
        throw new Error(`Error getting payment method: ${error.message}`);
    }
};

/**
 * Create new payment method
 */
const createPaymentMethod = async (data) => {
    try {
        // Check uniqueness of code
        const existing = await PaymentMethod.findOne({
            where: { code: data.code },
        });

        if (existing) {
            throw new Error(`Payment method with code "${data.code}" already exists`);
        }

        const method = await PaymentMethod.create(data);
        console.log(`✅ Payment method created: ${method.code}`);
        return method;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Update payment method
 */
const updatePaymentMethod = async (id, data) => {
    try {
        const method = await PaymentMethod.findByPk(id);

        if (!method) {
            throw new Error("Payment method not found");
        }

        // If code is changing, check uniqueness
        if (data.code && data.code !== method.code) {
            const existing = await PaymentMethod.findOne({
                where: { code: data.code, id: { [Op.ne]: id } },
            });

            if (existing) {
                throw new Error(`Payment method with code "${data.code}" already exists`);
            }
        }

        await method.update(data);
        console.log(`✅ Payment method updated: ${method.code}`);
        return method;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Toggle enabled status
 */
const togglePaymentMethodStatus = async (id) => {
    try {
        const method = await PaymentMethod.findByPk(id);

        if (!method) {
            throw new Error("Payment method not found");
        }

        await method.update({ enabled: !method.enabled });
        console.log(`🔄 Payment method ${method.code} ${method.enabled ? "enabled" : "disabled"}`);
        return method;
    } catch (error) {
        throw new Error(error.message);
    }
};

/**
 * Soft delete — disables the method.
 * Prevents deletion if method has active (non-cancelled) orders.
 */
const deletePaymentMethod = async (id) => {
    try {
        const method = await PaymentMethod.findByPk(id);

        if (!method) {
            throw new Error("Payment method not found");
        }

        // Safety check: active orders using this method
        const activeOrders = await Order.count({
            where: {
                paymentMethodId: id,
                orderStatus: { [Op.notIn]: ["cancelled", "delivered"] },
            },
        });

        if (activeOrders > 0) {
            throw new Error(
                `Cannot delete payment method "${method.code}" — it has ${activeOrders} active order(s). Disable it instead.`
            );
        }

        // Soft delete = disable
        await method.update({ enabled: false });
        console.log(`🗑️ Payment method disabled: ${method.code}`);
        return method;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAvailablePaymentMethods,
    getAllPaymentMethods,
    getPaymentMethodById,
    createPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethodStatus,
    deletePaymentMethod,
};
