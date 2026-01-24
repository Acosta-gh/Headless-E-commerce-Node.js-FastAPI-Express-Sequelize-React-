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
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentId, mercadopagoStatus } = req.body;

    // Validar que viene desde tu servicio Python (opcional pero recomendado)
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const receivedSecret = req.headers["x-webhook-secret"];

    if (webhookSecret && webhookSecret !== receivedSecret) {
      return res.status(401).json({ 
        message: "Unauthorized webhook request" 
      });
    }

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

module.exports = {
  createOrder,
  getOrdersByUserId,
  updatePaymentStatus,
};