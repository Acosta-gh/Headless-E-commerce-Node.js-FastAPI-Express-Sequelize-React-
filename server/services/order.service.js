const { Order, OrderItem, Article } = require("@/models");
const { sequelize } = require("@/database/sequelize");
//const { createPreference } = require("@/services/mercadopago.service");
const axios = require("axios");

const MP_PROXY_URL = process.env.PY_MP_URL || "http://localhost:8000";

/**
 * Crear una orden con transacción atómica
 */
const createOrder = async (data, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const { items, paymentMethod } = data;

    // Validación de userId
    if (!userId) {
      throw new Error("UserId is required");
    }

    // Validación de items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // Validación de método de pago
    const allowedMethods = ["mercadopago", "cash"];
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
      throw new Error(
        `Invalid payment method. Allowed: ${allowedMethods.join(", ")}`,
      );
    }

    // ========================================================================
    // 🔒 Validar precios contra la base de datos
    // ========================================================================
    const productIds = items.map((item) => item.productId);
    const productsFromDB = await Article.findAll({
      where: { id: productIds },
      attributes: ["id", "title", "price", "stock"],
      transaction,
    });

    // Crear mapa para acceso rápido
    const productMap = new Map(productsFromDB.map((p) => [p.id, p]));

    // Validar cada item y usar precios de la DB
    const validatedItems = items.map((item) => {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Each item must have productId and quantity > 0");
      }

      const productFromDB = productMap.get(item.productId);

      if (!productFromDB) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      // Validar stock disponible (opcional pero recomendado)
      if (productFromDB.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${productFromDB.title}. Available: ${productFromDB.stock}, requested: ${item.quantity}`
        );
      }

      // 🔒 IMPORTANTE: Parsear el price que viene como string desde DECIMAL
      const dbPrice = parseFloat(productFromDB.price);

      return {
        productId: item.productId,
        title: productFromDB.title,
        unitPrice: dbPrice,
        quantity: parseInt(item.quantity),
      };
    });

    // Calcular total con precios validados
    const totalAmount = validatedItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    console.log("💰 Total calculado:", totalAmount); // Debug

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than 0");
    }
    // ========================================================================

    // Crear la orden
    const order = await Order.create(
      {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "unpaid" : "pending",
        orderStatus: "created",
      },
      { transaction },
    );

    // Usar validatedItems en lugar de items originales
    const orderItems = validatedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });
    await transaction.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    // MercadoPago - Usar validatedItems
    let mercadopagoData = null;
    if (paymentMethod === "mercadopago") {
      try {
        const mpItems = validatedItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "ARS",
        }));

        const { data: preference } = await axios.post(
          `${MP_PROXY_URL}/mp/preference`,
          {
            items: mpItems,
            external_reference: String(order.id),
          },
        );

        mercadopagoData = {
          preferenceId: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        };

        await createdOrder.update({
          mercadopagoPreferenceId: preference.id,
        });
      } catch (mpError) {
        console.error("Error creating MercadoPago preference:", mpError);
        await createdOrder.update({
          orderStatus: "cancelled",
          paymentStatus: "failed",
        });
        throw new Error(
          `Order created but MercadoPago preference failed: ${mpError.message}`,
        );
      }
    }

    return {
      ...createdOrder.toJSON(),
      mercadopago: mercadopagoData,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw new Error(`Error creating order: ${error.message}`);
  }
};

/**
 * Obtener órdenes de un usuario
 */
const getUserOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error("UserId is required");
    }

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return orders;
  } catch (error) {
    throw new Error(`Error getting user orders: ${error.message}`);
  }
};

/**
 * Obtener una orden por ID
 */
const getOrderById = async (orderId, userId = null) => {
  try {
    if (!orderId) {
      throw new Error("OrderId is required");
    }

    const where = { id: orderId };

    if (userId) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    throw new Error(`Error getting order: ${error.message}`);
  }
};

/**
 * Obtener orden por preferenceId de MercadoPago
 */
const getOrderByPreferenceId = async (preferenceId) => {
  try {
    if (!preferenceId) {
      throw new Error("PreferenceId is required");
    }

    const order = await Order.findOne({
      where: { mercadopagoPreferenceId: preferenceId },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found for this preference");
    }

    return order;
  } catch (error) {
    throw new Error(`Error getting order by preference: ${error.message}`);
  }
};

/**
 * Obtener orden por paymentId de MercadoPago
 */
const getOrderByPaymentId = async (paymentId) => {
  try {
    if (!paymentId) {
      throw new Error("PaymentId is required");
    }

    const order = await Order.findOne({
      where: { mercadopagoPaymentId: paymentId },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });

    if (!order) {
      throw new Error("Order not found for this payment");
    }

    return order;
  } catch (error) {
    throw new Error(`Error getting order by payment: ${error.message}`);
  }
};

/**
 * Actualizar estado de pago de una orden
 */
const updateOrderPaymentStatus = async (
  orderId,
  paymentStatus,
  paymentId = null,
) => {
  try {
    const validStatuses = ["unpaid", "pending", "paid", "failed", "refunded"];

    if (!validStatuses.includes(paymentStatus)) {
      throw new Error(
        `Invalid payment status. Allowed: ${validStatuses.join(", ")}`,
      );
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    const currentStatus = order.paymentStatus;

    // No permitir regresar de 'paid' a 'unpaid' o 'pending'
    if (
      currentStatus === "paid" &&
      ["unpaid", "pending"].includes(paymentStatus)
    ) {
      throw new Error("Cannot change paid order back to unpaid or pending");
    }

    // Solo permitir 'refunded' desde 'paid'
    if (paymentStatus === "refunded" && currentStatus !== "paid") {
      throw new Error("Only paid orders can be refunded");
    }

    // Preparar datos de actualización
    const updateData = { paymentStatus };

    // Si se proporciona paymentId, guardarlo
    if (paymentId) {
      updateData.mercadopagoPaymentId = paymentId;
    }

    await order.update(updateData);

    return order;
  } catch (error) {
    throw new Error(`Error updating order payment status: ${error.message}`);
  }
};

/**
 * Actualizar estado de una orden
 */
const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const validStatuses = ["created", "cancelled", "shipped", "delivered"];

    if (!validStatuses.includes(orderStatus)) {
      throw new Error(
        `Invalid order status. Allowed: ${validStatuses.join(", ")}`,
      );
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled" && orderStatus !== "cancelled") {
      throw new Error("Cannot modify a cancelled order");
    }

    if (order.orderStatus === "delivered" && orderStatus !== "delivered") {
      throw new Error("Cannot modify a delivered order");
    }

    await order.update({ orderStatus });

    return order;
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
};

/**
 * Cancelar una orden
 */
const cancelOrder = async (orderId, userId = null) => {
  try {
    const where = { id: orderId };

    if (userId) {
      where.userId = userId;
    }

    const order = await Order.findOne({ where });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === "paid") {
      throw new Error("Cannot cancel a paid order. Request a refund instead.");
    }

    if (order.orderStatus === "cancelled") {
      throw new Error("Order is already cancelled");
    }

    if (order.orderStatus === "delivered") {
      throw new Error("Cannot cancel a delivered order");
    }

    await order.update({
      orderStatus: "cancelled",
      paymentStatus: "failed",
    });

    return order;
  } catch (error) {
    throw new Error(`Error cancelling order: ${error.message}`);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderByPreferenceId,
  getOrderByPaymentId,
  updateOrderPaymentStatus,
  updateOrderStatus,
  cancelOrder,
};
