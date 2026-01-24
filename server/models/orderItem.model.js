// models/orderItem.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    orderId: { // Parent order
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productId: { // Article / Product ID
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: { // Snapshot del producto
      type: DataTypes.STRING,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { OrderItem };
