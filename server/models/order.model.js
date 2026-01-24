const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const Order = sequelize.define(
  "Order",
  {
    userId: {
      // Who placed the order
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    totalAmount: {
      // Total order amount
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paymentMethod: {
      // mercadopago | cash
      type: DataTypes.ENUM("mercadopago", "cash"),
      allowNull: false,
    },

    paymentStatus: {
      // unpaid | pending | paid | failed
      type: DataTypes.ENUM("unpaid", "pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "unpaid",
    },

    orderStatus: {
      // created | cancelled | shipped | delivered
      type: DataTypes.ENUM("created", "cancelled", "shipped", "delivered"),
      allowNull: false,
      defaultValue: "created",
    },

    // =====================
    // Mercado Pago fields
    // =====================
    mercadopagoPreferenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mercadopagoPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    mpMerchantOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = { Order };
