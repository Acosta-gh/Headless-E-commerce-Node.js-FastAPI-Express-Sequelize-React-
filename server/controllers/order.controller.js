const OrderService = require("@/services/order.service");

/**
 * 🛒 Create new order
 */
const createOrder = async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.body, req.user.id);
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * 📋 Get all orders for logged-in user
 */
const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await OrderService.getUserOrders(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * 🔍 Get specific order by ID (user's own order)
 */
const getOrderById = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(
      req.params.orderId,
      req.user.id // User can only see their own orders
    );
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(404).json({ success: false, message: error.message });
  }
};

/**
 * ❌ Cancel order (user's own order)
 */
const cancelOrderById = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await OrderService.cancelOrder(
      req.params.orderId,
      req.user.id, // Only allow user to cancel their own orders
      reason
    );
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 📦 Update payment status from webhook
 */
const updatePaymentFromWebhook = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentId, mercadopagoStatus } = req.body;

    console.log(`📦 Actualizando orden ${orderId}:`, {
      paymentStatus,
      paymentId,
      mercadopagoStatus,
    });

    const updatedOrder = await OrderService.updateOrderPaymentStatus(
      orderId,
      paymentStatus,
      paymentId
    );

    // Si el pago fue aprobado, actualizar también el orderStatus
    if (paymentStatus === "paid") {
      await OrderService.updateOrderStatus(orderId, "confirmed");
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 💳 Update payment status manually (Admin)
 */
const updatePaymentManually = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, note } = req.body;

    // Validación básica
    const allowedStatuses = ["paid", "failed", "refunded"];
    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Invalid paymentStatus. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    console.log(`🧑‍💼 Pago manual - Orden ${orderId}`, {
      paymentStatus,
      adminId: req.user.id,
      note,
    });

    const updatedOrder = await OrderService.updateOrderPaymentStatus(
      orderId,
      paymentStatus
    );

    // Lógica post-pago
    if (paymentStatus === "paid") {
      await OrderService.updateOrderStatus(orderId, "confirmed");
    }

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error("❌ Error manual payment update:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 📦 Update order status manually (Admin)
 */
const updateOrderStatusManually = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await OrderService.getOrderById(orderId);

    // Si quiere marcar como shipped o delivered, DEBE estar pagado
    if (["shipped", "delivered"].includes(orderStatus)) {
      if (order.paymentStatus !== "paid") {
        return res.status(400).json({
          success: false,
          message: `Cannot mark order as "${orderStatus}" - Payment status is "${order.paymentStatus}". Order must be paid first.`,
          currentPaymentStatus: order.paymentStatus,
          currentOrderStatus: order.orderStatus,
        });
      }
    }

    console.log(`🧑‍💼 Orden manual - Orden ${orderId}`, {
      orderStatus,
      adminId: req.user.id,
      currentStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    });

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      orderStatus
    );

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error("❌ Error manual order update:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 📋 Get all orders (Admin)
 */
const getAllOrders = async (req, res) => {
  try {
    const { Order, OrderItem, PaymentMethod, ShippingMethod, User } = require('@/models');
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) {
      where.orderStatus = status;
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: PaymentMethod,
          as: 'paymentMethod',
          attributes: ['id', 'code', 'name']
        },
        {
          model: ShippingMethod,
          as: 'shippingMethod',
          attributes: ['id', 'code', 'name', 'carrierName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Order.count({ where });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + orders.length < total
      }
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔍 Get order by ID (Admin - any order)
 */
const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.orderId);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order by ID (admin) error:", error);
    res.status(404).json({ success: false, message: error.message });
  }
};

/**
 * 📝 Add tracking number (Admin)
 */
const addTrackingNumber = async (req, res) => {
  try {
    const { Order } = require('@/models');
    const { trackingNumber, carrierName } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({
      trackingNumber,
      carrierName: carrierName || order.carrierName
    });

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Add tracking number error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📝 Add admin notes (Admin)
 */
const addAdminNotes = async (req, res) => {
  try {
    const { Order } = require('@/models');
    const { adminNotes } = req.body;

    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({ adminNotes });

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Add admin notes error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ❌ Cancel order (Admin - any order)
 */
const cancelOrderByIdAdmin = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await OrderService.cancelOrder(
      req.params.orderId,
      null, // Admin can cancel any order
      reason || 'Cancelled by admin'
    );
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Cancel order (admin) error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 📊 Get order statistics (Admin)
 */
const getOrderStats = async (req, res) => {
  try {
    const { Order } = require('@/models');
    const { sequelize } = require('@/database/sequelize');

    const stats = await Order.findAll({
      attributes: [
        'orderStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total'],
      ],
      group: ['orderStatus'],
    });

    const paymentStats = await Order.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'total'],
      ],
      group: ['paymentStatus'],
    });

    res.status(200).json({
      success: true,
      orderStats: stats,
      paymentStats: paymentStats,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // User endpoints
  createOrder,
  getOrdersByUserId,
  getOrderById,
  cancelOrderById,
  
  // Webhook endpoint
  updatePaymentFromWebhook,
  
  // Admin endpoints
  updatePaymentManually,
  updateOrderStatusManually,
  getAllOrders,
  getOrderByIdAdmin,
  addTrackingNumber,
  addAdminNotes,
  cancelOrderByIdAdmin,
  getOrderStats,
};