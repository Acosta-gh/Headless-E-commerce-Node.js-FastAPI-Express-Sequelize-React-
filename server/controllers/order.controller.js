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
      req.user.id
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
      req.user.id,
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
 * REFACTORED: Moved query logic to service
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const result = await OrderService.getAllOrdersAdmin({
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
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
 * REFACTORED: Moved to service
 */
const addTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber, carrierName } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required'
      });
    }

    const order = await OrderService.addTrackingNumber(
      req.params.orderId,
      trackingNumber,
      carrierName
    );

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
 * REFACTORED: Moved to service
 */
const addAdminNotes = async (req, res) => {
  try {
    const { adminNotes } = req.body;

    const order = await OrderService.addAdminNotes(
      req.params.orderId,
      adminNotes
    );

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
      null,
      reason || 'Cancelled by admin'
    );
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Cancel order (admin) error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 📊 Get comprehensive order statistics (Admin)
 * REFACTORED: Moved all query logic to service
 */
const getOrderStats = async (req, res) => {
  try {
    const { period = "30d", startDate, endDate } = req.query;

    const stats = await OrderService.getOrderStatistics({
      period,
      startDate,
      endDate
    });

    res.status(200).json(stats);

  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * 📄 Export statistics to CSV
 * REFACTORED: Moved query logic to service
 */
const exportStatsToCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const csv = await OrderService.exportOrdersToCSV({
      startDate,
      endDate
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=orders-export-${Date.now()}.csv`);
    res.status(200).send(csv);

  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📄 Export statistics to PDF
 * REFACTORED: Moved to service
 */
const exportStatsToPDF = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    const pdfStream = await OrderService.exportOrderStatsToPDF({ period });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=stats-report-${Date.now()}.pdf`);

    pdfStream.pipe(res);

  } catch (error) {
    console.error("Export PDF error:", error);
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
  exportStatsToCSV,
  exportStatsToPDF
};