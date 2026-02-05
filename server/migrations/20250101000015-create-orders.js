'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Order Identification
      orderNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      // User Relationship
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // Customer Information
      customerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Shipping Address
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingAddressLine2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shippingCity: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingState: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingPostalCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shippingCountry: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'AR',
      },
      // Shipping Information
      shippingMethodId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'shipping_methods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      shippingCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      carrierName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Amounts Breakdown
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Discount from payment method',
      },
      surchargeAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      // Coupons (CORREGIDO: eliminada duplicación)
      couponId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Coupons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      couponCode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Coupon code snapshot',
      },
      couponDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Discount from coupon',
      },
      // Payment Information
      paymentMethodId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payment_methods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      paymentStatus: {
        type: Sequelize.ENUM('unpaid', 'pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      // Order Status
      orderStatus: {
        type: Sequelize.ENUM('created', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'created',
      },
      // Mercado Pago Integration
      mercadopagoPreferenceId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mercadopagoPaymentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mpMerchantOrderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Billing Information
      billingDocumentType: {
        type: Sequelize.ENUM('DNI', 'CUIT', 'CUIL', 'Passport'),
        allowNull: true,
      },
      billingDocumentNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      billingBusinessName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      requiresInvoice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Notes
      orderNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Status Timestamps
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      confirmedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      shippedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Additional Metadata
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('Orders', ['orderNumber'], { unique: true });
    await queryInterface.addIndex('Orders', ['userId']);
    await queryInterface.addIndex('Orders', ['orderStatus']);
    await queryInterface.addIndex('Orders', ['paymentStatus']);
    await queryInterface.addIndex('Orders', ['mercadopagoPaymentId']);
    await queryInterface.addIndex('Orders', ['createdAt']);
    await queryInterface.addIndex('Orders', ['couponId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Orders');
  }
};