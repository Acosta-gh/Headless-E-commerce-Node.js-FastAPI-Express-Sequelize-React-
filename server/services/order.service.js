/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const { Order, OrderItem, Article, PaymentMethod } = require("@/models");
const { sequelize } = require("@/database/sequelize");
const { createPreference } = require("@/services/mercadopago.service");


/**
 * Helper para devolver stock al inventario
 */
const restoreStock = async (items, transaction, reason) => {
  console.log(`${reason} - Devolviendo stock`); // ✅ Corregí el error de sintaxis
  for (const item of items) {
    await Article.increment('stock', {
      by: item.quantity,
      where: { id: item.productId },
      transaction
    });
    console.log(`📦 Stock devuelto: ${item.title} - Cantidad: ${item.quantity}`); // ✅ Corregí el error de sintaxis
  }
};


/**
 * Crear una orden con transacción atómica
 */
const createOrder = async (data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, paymentMethodCode } = data;

    // Validación de userId
    if (!userId) {
      throw new Error("UserId is required");
    }

    // Validación de items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // Validación de método de pago
    const paymentMethod = await PaymentMethod.findOne({
      where: {
        code: paymentMethodCode,
        enabled: true
      },
      transaction
    });

    if (!paymentMethod) {
      throw new Error("Invalid or disabled payment method");
    }

    // Validar productos y stock
    const productIds = items.map((item) => item.productId);
    const productsFromDB = await Article.findAll({
      where: { id: productIds },
      attributes: ["id", "title", "price", "stock"],
      transaction,
      lock: transaction.LOCK.UPDATE,
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

      // Validar stock disponible
      if (productFromDB.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${productFromDB.title}. Available: ${productFromDB.stock}, requested: ${item.quantity}`
        );
      }

      // Parsear el price que viene como string desde DECIMAL
      const dbPrice = parseFloat(productFromDB.price);

      return {
        productId: item.productId,
        title: productFromDB.title,
        unitPrice: dbPrice,
        quantity: parseInt(item.quantity),
      };
    });

    //DECREMENTAR STOCK (reserva)
    for (const item of validatedItems) {
      const product = productMap.get(item.productId);
      await product.decrement('stock', {
        by: item.quantity,
        transaction
      });
      console.log(`📦 Stock reservado: ${product.title} - Cantidad: ${item.quantity}`);
    }

    const subtotal = validatedItems.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    const discountAmount = (subtotal * parseFloat(paymentMethod.discountPercentage)) / 100;
    const surchargeAmount = (subtotal * parseFloat(paymentMethod.surchargePercentage)) / 100;
    const totalAmount = subtotal - discountAmount + surchargeAmount;

    console.log("💰 Subtotal:", subtotal);
    console.log("🎁 Descuento:", discountAmount, `(${paymentMethod.discountPercentage}%)`);
    console.log("💳 Recargo:", surchargeAmount, `(${paymentMethod.surchargePercentage}%)`);
    console.log("💰 Total final:", totalAmount);

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than 0");
    }

    // ========================================================================
    // Crear la orden
    // ========================================================================
    const order = await Order.create(
      {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentMethodId: paymentMethod.id,
        // - cash/bank_transfer: unpaid (requiere confirmación manual)
        // - mercadopago: pending (se confirmará automáticamen  te vía webhook)
        paymentStatus: (paymentMethod.code === "cash" || paymentMethod.code === "bank_transfer")
          ? "unpaid"
          : "pending",
        orderStatus: "created",
      },
      { transaction }
    );

    // Crear OrderItems
    const orderItems = validatedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    // ========================================================================
    // MercadoPago - Si el método de pago es mercadopago
    // ========================================================================
    let mercadopagoData = null;

    if (paymentMethod.code === "mercadopago") {
      try {
        // Preparar items para MercadoPago con precios validados de la DB
        const mpItems = validatedItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice, // ✅ Precio validado desde DB
          currency_id: "ARS",
        }));

        // ✅ Llamar al servicio de MercadoPago directamente (Node.js)
        const preference = await createPreference({
          items: mpItems,
          external_reference: String(order.id),
        });

        mercadopagoData = {
          preferenceId: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        };

        // Actualizar orden con el preferenceId
        await order.update(
          { mercadopagoPreferenceId: preference.id },
          { transaction }
        );

      } catch (mpError) {
        console.error("❌ Error creating MercadoPago preference:", mpError);

        // Rollback de la transacción si falla MercadoPago
        await transaction.rollback();

        throw new Error(
          `Order creation failed: ${mpError.message}`
        );
      }
    }

    // ========================================================================
    // Commit de la transacción
    // ========================================================================
    await transaction.commit();

    // Obtener orden completa con items
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items"
        },
        {
          model: PaymentMethod,
          as: "payment",
          attributes: ['id', 'code', 'name', 'discountPercentage', 'surchargePercentage']
        }
      ],
    });

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
  paymentId = null
) => {
  const transaction = await sequelize.transaction();

  try {
    const validStatuses = ["unpaid", "pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      throw new Error(
        `Invalid payment status. Allowed: ${validStatuses.join(", ")}`
      );
    }

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    });

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

    // ========================================================================
    // Gestion de stock segun cambio de estado
    // ========================================================================

    // Caso 1: Pago exitoso (pending/unpaid → paid)
    if (paymentStatus === "paid" && ["pending", "unpaid"].includes(currentStatus)) {
      console.log("✅ Pago confirmado - Stock ya estaba reservado");
    }

    // Caso 2: Pago fallido (pending/unpaid → failed)
    if (paymentStatus === "failed" && ["pending", "unpaid"].includes(currentStatus)) {
      await restoreStock(order.items, transaction, "❌ Pago fallido");
    }

    // Caso 3: Reembolso (paid → refunded)
    if (paymentStatus === "refunded" && currentStatus === "paid") {
      await restoreStock(order.items, transaction, "💸 Reembolso");
    }


    // Preparar datos de actualización
    const updateData = { paymentStatus };

    if (paymentId) {
      updateData.mercadopagoPaymentId = paymentId;
    }

    await order.update(updateData, { transaction });
    await transaction.commit();

    return order;
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
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
        `Invalid order status. Allowed: ${validStatuses.join(", ")}`
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
  const transaction = await sequelize.transaction();

  try {
    const where = { id: orderId };
    if (userId) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    });

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

    // ========================================================================
    // Devolver stock al cancelar al cancelar
    // ========================================================================
    console.log("🚫 Cancelando orden - Devolviendo stock");

    await restoreStock(order.items, transaction, "🚫 Cancelando orden");

    await order.update({
      orderStatus: "cancelled",
      paymentStatus: "failed",
    }, { transaction });

    await transaction.commit();

    return order;
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
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