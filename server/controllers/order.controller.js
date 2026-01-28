const OrderService = require("@/services/order.service");

const createOrder = async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.body, req.user.id);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await OrderService.getUserOrders(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};  

/**
 * Actualizar estado de pago desde webhook Python
 */
const updatePaymentFromWebhook = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentId, mercadopagoStatus } = req.body;

    console.log(` 📦 Actualizando orden ${orderId}:`, {
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
      await OrderService.updateOrderStatus(orderId, "shipped");
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
 * Actualizar estado de pago MANUALMENTE (admin)
 * Ej: efectivo, transferencia, corrección manual
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
      await OrderService.updateOrderStatus(orderId, "shipped");
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

module.exports = {
  createOrder,
  getOrdersByUserId,
  updatePaymentFromWebhook,
  updatePaymentManually,
  updateOrderStatusManually
};