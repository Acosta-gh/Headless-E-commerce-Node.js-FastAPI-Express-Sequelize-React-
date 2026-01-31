/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const { Order, OrderItem, Article, PaymentMethod, ShippingMethod, User } = require("@/models");
const { sequelize } = require("@/database/sequelize");
const { createPreference } = require("@/services/mercadopago.service");
const { calculateShippingCost, validateShippingMethod } = require("@/services/shipping.service");
const CouponService = require("@/services/coupon.service");
/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${randomNum}`;
};

/**
 * 🔄 Restore stock for given items.
 */
const restoreStock = async (items, transaction, reason) => {
  console.log(`${reason} - Restoring stock`);
  for (const item of items) {
    await Article.increment('stock', {
      by: item.quantity,
      where: { id: item.productId },
      transaction
    });
    console.log(`📦 Stock restored: ${item.title} - Quantity: ${item.quantity}`);
  }
};

/**
 * 🛒 Create a new order with transaction support.
 * @param {Object} data
 * @param {Array<{productId: number, quantity: number}>} data.items
 * @param {string} data.paymentMethodCode
 * @param {number} data.shippingMethodId
 * @param {Object} data.customerInfo - {name, email, phone}
 * @param {Object} data.shippingAddress - Full shipping address
 * @param {Object} [data.billingInfo] - Optional billing information
 * @param {string} [data.orderNotes] - Optional customer notes
 * @param {string} [data.couponCode] - Optional coupon code
 * @param {number} userId
 */
const createOrder = async (data, userId) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      items,
      paymentMethodCode,
      shippingMethodId,
      customerInfo,
      shippingAddress,
      billingInfo,
      orderNotes,
      couponCode
    } = data;

    // =====================
    // Validate required fields
    // =====================
    if (!userId) {
      throw new Error("UserId is required");
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      throw new Error("Customer information (name, email, phone) is required");
    }
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city ||
      !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      throw new Error("Complete shipping address is required");
    }

    // Fetch user
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      throw new Error("User not found");
    }

    // =====================
    // Validate payment method
    // =====================
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

    // =====================
    // Validate shipping method
    // =====================
    const shippingMethod = await ShippingMethod.findOne({
      where: {
        id: shippingMethodId,
        enabled: true
      },
      transaction
    });

    if (!shippingMethod) {
      throw new Error("Invalid or disabled shipping method");
    }

    // =====================
    // Fetch and validate products
    // =====================
    const productIds = items.map((item) => item.productId);
    const productsFromDB = await Article.findAll({
      where: { id: productIds },
      attributes: ["id", "title", "price", "stock", "content", "sku"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const productMap = new Map(productsFromDB.map((p) => [p.id, p]));

    // Validate items & stock
    const validatedItems = items.map((item) => {

      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Each item must have productId and quantity > 0");
      }
      const productFromDB = productMap.get(item.productId);
      if (!productFromDB) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      if (productFromDB.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${productFromDB.title}. Available: ${productFromDB.stock}, requested: ${item.quantity}`
        );
      }
      const dbPrice = parseFloat(productFromDB.price);
      return {
        productId: item.productId,
        title: productFromDB.title,
        description: productFromDB.description?.substring(0, 200),
        sku: productFromDB.sku || `SKU-${productFromDB.id}`,
        unitPrice: dbPrice,
        quantity: parseInt(item.quantity),
      };
    });

    // =====================
    // Reserve stock
    // =====================
    for (const item of validatedItems) {
      const product = productMap.get(item.productId);
      await product.decrement('stock', {
        by: item.quantity,
        transaction
      });
      console.log(`📦 Stock reserved: ${product.title} - Quantity: ${item.quantity}`);
    }

    // =====================
    // Calculate subtotal
    // =====================
    const subtotal = validatedItems.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    // =====================
    // Calculate shipping cost
    // =====================
    const shippingCostData = await calculateShippingCost(
      shippingMethodId,
      {
        shippingCountry: shippingAddress.country,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
      },
      subtotal,
      0 // TODO: Calculate total order weight if needed
    );

    let shippingCost = shippingCostData.cost;

    // =====================
    // Validate and apply coupon
    // =====================
    let appliedCoupon = null;
    let couponDiscount = 0;

    if (couponCode) {
      const couponResult = await CouponService.validateAndApplyCoupon(
        couponCode,
        userId,
        validatedItems,
        subtotal,
        shippingCost,
        transaction
      );

      appliedCoupon = couponResult.coupon;
      couponDiscount = couponResult.discountAmount;

      // Apply free shipping if applicable
      if (couponResult.freeShipping) {
        shippingCost = 0;
        console.log("🎫 Free shipping applied from coupon");
      }
    }


    // =====================
    // Apply payment method discounts/surcharges
    // =====================
    const paymentDiscountPercentage = Number(paymentMethod.discountPercentage) || 0;
    const paymentSurchargePercentage = Number(paymentMethod.surchargePercentage) || 0;

    let paymentDiscount = (subtotal * paymentDiscountPercentage) / 100;
    const surchargeAmount = (subtotal * paymentSurchargePercentage) / 100;


    // Check if coupon can be combined with payment discount
    if (appliedCoupon && !appliedCoupon.combineWithPaymentDiscount) {
      paymentDiscount = 0;
      console.log("⚠️  Payment method discount disabled due to coupon rules");
    }

    const totalDiscountAmount = couponDiscount + paymentDiscount;

    // =====================
    // Calculate final total
    // =====================
    const totalAmount = subtotal + shippingCost + surchargeAmount - totalDiscountAmount;

    console.log("💰 Order Breakdown:");
    console.log("   Subtotal:", subtotal.toFixed(2));
    console.log("   Shipping:", shippingCost.toFixed(2));
    console.log("   Coupon Discount:", couponDiscount.toFixed(2));
    console.log("   Payment Discount:", paymentDiscount.toFixed(2), `(${paymentMethod.discountPercentage}%)`);
    console.log("   Surcharge:", surchargeAmount.toFixed(2), `(${paymentMethod.surchargePercentage}%)`);
    console.log("   TOTAL:", totalAmount.toFixed(2));

    if (totalAmount <= 0) {
      throw new Error("Order total must be greater than 0");
    }

    // =====================
    // Create order record
    // =====================
    const order = await Order.create(
      {
        orderNumber: generateOrderNumber(),
        userId,

        // Customer info
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,

        // Shipping address
        shippingAddress: shippingAddress.address,
        shippingAddressLine2: shippingAddress.addressLine2 || null,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,

        // Shipping method
        shippingMethodId: shippingMethodId,
        shippingCost: parseFloat(shippingCost.toFixed(2)),

        // Amounts
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
        surchargeAmount: parseFloat(surchargeAmount.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),

        // Coupon info
        couponId: appliedCoupon?.id || null,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: parseFloat(couponDiscount.toFixed(2)),

        // Payment
        paymentMethodId: paymentMethod.id,
        paymentStatus: (paymentMethod.code === "cash" || paymentMethod.code === "bank_transfer")
          ? "unpaid"
          : "pending",
        orderStatus: "created",

        // Optional fields
        orderNotes: orderNotes || null,

        // Billing info (optional)
        billingDocumentType: billingInfo?.documentType || null,
        billingDocumentNumber: billingInfo?.documentNumber || null,
        billingBusinessName: billingInfo?.businessName || null,
        requiresInvoice: billingInfo?.requiresInvoice || false,

        // Metadata
        ipAddress: null, // TODO: Get from request
        userAgent: null, // TODO: Get from request
      },
      { transaction }
    );

    // =====================
    // Create order items
    // =====================
    const orderItems = validatedItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      title: item.title,
      description: item.description,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: (item.unitPrice * item.quantity),
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    // =====================
    // Record coupon usage
    // =====================
    if (appliedCoupon) {
      await CouponService.recordCouponUsage(
        appliedCoupon.id,
        userId,
        order.id,
        couponDiscount,
        transaction
      );
    }

    // =====================
    // MercadoPago integration
    // =====================
    let mercadopagoData = null;
    if (paymentMethod.code === "mercadopago") {
      try {
        const mpItems = validatedItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: "ARS",
        }));

        // Add shipping as an item if not free
        if (shippingCost > 0) {
          mpItems.push({
            title: `Shipping - ${shippingMethod.name}`,
            quantity: 1,
            unit_price: shippingCost,
            currency_id: "ARS",
          });
        }

        const preference = await createPreference({
          items: mpItems,
          external_reference: String(order.id),
          payer: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: {
              number: customerInfo.phone
            },
            address: {
              street_name: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zip_code: shippingAddress.postalCode,
            }
          }
        });

        mercadopagoData = {
          preferenceId: preference.id,
          init_point: preference.init_point,
          sandbox_init_point: preference.sandbox_init_point,
        };

        await order.update(
          { mercadopagoPreferenceId: preference.id },
          { transaction }
        );
      } catch (mpError) {
        console.error("❌ Error creating MercadoPago preference:", mpError);
        await transaction.rollback();
        throw new Error(`Order creation failed: ${mpError.message}`);
      }
    }

    await transaction.commit();

    // =====================
    // Fetch complete order for response
    // =====================
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: ['id', 'productId', 'title', 'sku', 'quantity', 'unitPrice', 'subtotal']
        },
        {
          model: PaymentMethod,
          as: "paymentMethod",
          attributes: ['id', 'code', 'name', 'discountPercentage', 'surchargePercentage']
        },
        {
          model: ShippingMethod,
          as: "shippingMethod",
          attributes: ['id', 'code', 'name', 'carrierName', 'estimatedDaysMin', 'estimatedDaysMax']
        }
      ],
    });

    // =====================
    // Build clean response
    // =====================
    return {
      order: {
        id: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        orderStatus: createdOrder.orderStatus,
        paymentStatus: createdOrder.paymentStatus,
        createdAt: createdOrder.createdAt,
      },

      customer: {
        name: createdOrder.customerName,
        email: createdOrder.customerEmail,
        phone: createdOrder.customerPhone,
      },

      shipping: {
        method: createdOrder.shippingMethod,
        cost: parseFloat(createdOrder.shippingCost),
        address: {
          street: createdOrder.shippingAddress,
          addressLine2: createdOrder.shippingAddressLine2,
          city: createdOrder.shippingCity,
          state: createdOrder.shippingState,
          postalCode: createdOrder.shippingPostalCode,
          country: createdOrder.shippingCountry,
        },
        tracking: {
          number: createdOrder.trackingNumber,
          carrier: createdOrder.carrierName,
        },
      },

      payment: {
        method: createdOrder.paymentMethod,
        status: createdOrder.paymentStatus,
        paidAt: createdOrder.paidAt,
      },

      pricing: {
        subtotal: parseFloat(createdOrder.subtotal),
        shipping: parseFloat(createdOrder.shippingCost),
        discount: {
          coupon: parseFloat(createdOrder.couponDiscount),
          payment: parseFloat(createdOrder.discountAmount) - parseFloat(createdOrder.couponDiscount),
          total: parseFloat(createdOrder.discountAmount),
        },
        surcharge: parseFloat(createdOrder.surchargeAmount),
        tax: parseFloat(createdOrder.tax),
        total: parseFloat(createdOrder.totalAmount),
      },

      coupon: createdOrder.couponId ? {
        id: createdOrder.couponId,
        code: createdOrder.couponCode,
        discount: parseFloat(createdOrder.couponDiscount),
      } : null,

      items: createdOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        subtotal: parseFloat(item.subtotal),
      })),

      billing: createdOrder.requiresInvoice ? {
        documentType: createdOrder.billingDocumentType,
        documentNumber: createdOrder.billingDocumentNumber,
        businessName: createdOrder.billingBusinessName,
        requiresInvoice: createdOrder.requiresInvoice,
      } : null,

      notes: {
        customer: createdOrder.orderNotes,
        admin: createdOrder.adminNotes,
      },

      mercadopago: mercadopagoData,

      metadata: {
        ipAddress: createdOrder.ipAddress,
        userAgent: createdOrder.userAgent,
      },
    };

  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw new Error(`Error creating order: ${error.message}`);
  }
};

/**
 * 👤 Get all orders for a user
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
        {
          model: PaymentMethod,
          as: "paymentMethod",
          attributes: ['id', 'code', 'name']
        },
        {
          model: ShippingMethod,
          as: "shippingMethod",
          attributes: ['id', 'code', 'name', 'carrierName']
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    return orders;
  } catch (error) {
    throw new Error(`Error getting user orders: ${error.message}`);
  }
};

/**
 * 🔍 Get an order by ID
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
        {
          model: PaymentMethod,
          as: "paymentMethod",
        },
        {
          model: ShippingMethod,
          as: "shippingMethod",
        }
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
 * 🔑 Get order by MercadoPago preference ID
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
 * 💳 Get order by MercadoPago payment ID
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
 * 🔄 Update payment status
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

    if (
      currentStatus === "paid" &&
      ["unpaid", "pending"].includes(paymentStatus)
    ) {
      throw new Error("Cannot change paid order back to unpaid or pending");
    }

    if (paymentStatus === "refunded" && currentStatus !== "paid") {
      throw new Error("Only paid orders can be refunded");
    }

    // Handle stock changes
    if (paymentStatus === "paid" && ["pending", "unpaid"].includes(currentStatus)) {
      console.log("✅ Payment confirmed - Stock was already reserved");
      await order.update({ paidAt: new Date() }, { transaction });
    }
    if (paymentStatus === "failed" && ["pending", "unpaid"].includes(currentStatus)) {
      await restoreStock(order.items, transaction, "❌ Payment failed");
    }
    if (paymentStatus === "refunded" && currentStatus === "paid") {
      await restoreStock(order.items, transaction, "💸 Refund");
    }

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
 * 📦 Update order status
 */
const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const validStatuses = ["created", "confirmed", "processing", "shipped", "delivered", "cancelled"];
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

    const updateData = { orderStatus };

    // Update timestamps
    if (orderStatus === "confirmed" && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (orderStatus === "shipped" && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }
    if (orderStatus === "delivered" && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);
    return order;
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
};

/**
 * ❌ Cancel an order
 */
const cancelOrder = async (orderId, userId = null, reason = null) => {
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

    await restoreStock(order.items, transaction, "🚫 Order cancelled");

    await order.update({
      orderStatus: "cancelled",
      paymentStatus: "failed",
      cancelledAt: new Date(),
      cancelReason: reason,
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