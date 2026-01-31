const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const CouponUsage = sequelize.define("CouponUsage", {
  couponId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Un cupón por orden
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Actual discount amount applied',
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['couponId', 'userId'],
    },
    {
      fields: ['orderId'],
      unique: true,
    },
  ],
});

module.exports = { CouponUsage };