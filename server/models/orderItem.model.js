const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    // =====================
    // Relationships
    // =====================
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Parent order',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Can be null if product is deleted
      comment: 'Reference to original product',
    },

    // =====================
    // Product Snapshot
    // (Data at time of purchase)
    // =====================
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Product name at time of purchase',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Product description at time of purchase',
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Product SKU',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Main product image URL',
    },

    // =====================
    // Prices and Quantities
    // =====================
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Unit price at time of purchase',
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Subtotal: (unitPrice * quantity) - discount',
    },

    // =====================
    // Variants (if applicable)
    // =====================
    productVariant: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Product variants (e.g., {color: "red", size: "M"})',
    },

    // =====================
    // Additional Information
    // =====================
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special notes about this item',
    },

    // =====================
    // Refund Control
    // =====================
    isRefunded: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    refundedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    refundedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['productId'],
      },
    ],
  }
);

module.exports = { OrderItem };