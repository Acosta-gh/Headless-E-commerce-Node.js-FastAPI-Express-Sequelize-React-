const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const Order = sequelize.define(
  "Order",
  {

    couponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Applied coupon',
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Coupon code snapshot',
    },
    couponDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Discount from coupon',
    },

    // =====================
    // Order Identification
    // =====================
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique order number (e.g., ORD-20260128-0001)',
    },

    // =====================
    // User Relationship
    // =====================
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User who placed the order',
    },

    // =====================
    // Customer Information
    // =====================
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Customer full name',
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // =====================
    // Shipping Address
    // =====================
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Street and number',
    },
    shippingAddressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Floor, apartment, additional references',
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Province/State',
    },
    shippingPostalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'AR',
    },

    // =====================
    // Shipping Information
    // =====================
    shippingMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'shipping_methods',
        key: 'id'
      },
      comment: 'Reference to shipping method',
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Calculated shipping cost based on method and location',
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Shipment tracking number',
    },
    carrierName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Shipping carrier name',
    },

    // =====================
    // Amounts Breakdown
    // =====================
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Sum of all items',
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Applied taxes',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Discount applied from payment method or coupon',
    },
    surchargeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Surcharge from payment method',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Final total: subtotal + shippingCost + tax + surchargeAmount - discountAmount',
    },

    // =====================
    // Coupons & Discounts
    // =====================
    couponCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Applied coupon code',
    },

    // =====================
    // Payment Information
    // =====================
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payment_methods',
        key: 'id',
      },
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "unpaid",
    },

    // =====================
    // Order Status
    // =====================
    orderStatus: {
      type: DataTypes.ENUM(
        "created",      // Order created
        "confirmed",    // Payment confirmed
        "processing",   // Being prepared
        "shipped",      // Shipped
        "delivered",    // Delivered
        "cancelled"     // Cancelled
      ),
      allowNull: false,
      defaultValue: "created",
    },

    // =====================
    // Mercado Pago Integration
    // =====================
    mercadopagoPreferenceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'MercadoPago preference ID',
    },
    mercadopagoPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'MercadoPago payment ID',
    },
    mpMerchantOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'MercadoPago merchant order ID',
    },

    // =====================
    // Billing Information (Optional)
    // =====================
    billingDocumentType: {
      type: DataTypes.ENUM('DNI', 'CUIT', 'CUIL', 'Passport'),
      allowNull: true,
      comment: 'Document type for billing',
    },
    billingDocumentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Document number',
    },
    billingBusinessName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Business name (for B or C invoices)',
    },
    requiresInvoice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // =====================
    // Notes
    // =====================
    orderNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Customer notes about the order',
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Internal admin notes',
    },

    // =====================
    // Status Timestamps
    // =====================
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Payment confirmation date',
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Order confirmation date',
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Shipping date',
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Delivery date',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Cancellation date',
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Cancellation reason',
    },

    // =====================
    // Additional Metadata
    // =====================
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address from where order was placed',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Browser user agent',
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['orderNumber'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['orderStatus'],
      },
      {
        fields: ['paymentStatus'],
      },
      {
        fields: ['mercadopagoPaymentId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
    hooks: {
      beforeCreate: async (order) => {
        // Generate orderNumber if not exists
        if (!order.orderNumber) {
          const date = new Date();
          const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
          const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          order.orderNumber = `ORD-${dateStr}-${randomNum}`;
        }
      },
    },
  }
);

module.exports = { Order };