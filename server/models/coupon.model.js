const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const Coupon = sequelize.define("Coupon", {
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Unique coupon code',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Internal description',
  },
  
  // =====================
  // Discount Configuration
  // =====================
  discountType: {
    type: DataTypes.ENUM("percentage", "fixed", "free_shipping"),
    allowNull: false,
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Required for percentage/fixed, null for free_shipping',
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Max discount cap (only for percentage)',
  },
  
  // =====================
  // Order Requirements
  // =====================
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Minimum order subtotal to apply coupon',
  },
  
  // =====================
  // Usage Limits
  // =====================
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total usage limit (null = unlimited)',
  },
  usagePerUser: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    comment: 'Max uses per user',
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Times this coupon has been used',
  },
  
  // =====================
  // Restrictions (IMPORTANTE - TE FALTABAN ESTOS)
  // =====================
  appliesToProducts: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of product IDs [1, 2, 3] or null for all products',
    // Ejemplo: [1, 5, 10] = solo aplica a esos productos
  },
  appliesToCategories: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of category IDs or null for all categories',
  },
  excludedProducts: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of product IDs to exclude',
  },
  excludedCategories: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of category IDs to exclude',
  },
  
  // =====================
  // User Restrictions
  // =====================
  specificUsers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of user IDs who can use this coupon (null = all users)',
  },
  newUsersOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Only for users with no previous orders',
  },
  
  // =====================
  // Combination Rules
  // =====================
  combinable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Can be combined with other coupons',
  },
  combineWithPaymentDiscount: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Can be combined with payment method discounts',
  },
  
  // =====================
  // Validity Period
  // =====================
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When coupon becomes valid',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When coupon expires',
  },
  
  // =====================
  // Status
  // =====================
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  
  // =====================
  // Metadata (ÚTIL PARA TRACKING)
  // =====================
  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this coupon',
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Marketing campaign name',
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['startsAt', 'expiresAt'],
    },
  ],
  hooks: {
    beforeValidate: (coupon) => {
      // Convert code to uppercase
      if (coupon.code) {
        coupon.code = coupon.code.toUpperCase().trim();
      }
      
      // Validate discountValue is required for percentage/fixed
      if (['percentage', 'fixed'].includes(coupon.discountType) && !coupon.discountValue) {
        throw new Error('discountValue is required for percentage and fixed discount types');
      }
      
      // Validate percentage is between 0-100
      if (coupon.discountType === 'percentage' && (coupon.discountValue < 0 || coupon.discountValue > 100)) {
        throw new Error('Percentage discount must be between 0 and 100');
      }
    },
  },
});

module.exports = { Coupon };