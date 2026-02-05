'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Coupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // Discount Configuration
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed', 'free_shipping'),
        allowNull: false,
      },
      discountValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      maxDiscountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      // Order Requirements
      minOrderAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      // Usage Limits
      usageLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      usagePerUser: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      usedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      // Restrictions
      appliesToProducts: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      appliesToCategories: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excludedProducts: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excludedCategories: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      // User Restrictions
      specificUsers: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      newUsersOnly: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      // Combination Rules
      combinable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      combineWithPaymentDiscount: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      // Validity Period
      startsAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // Status
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      // Metadata
      internalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      campaignName: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('Coupons', ['code'], { unique: true });
    await queryInterface.addIndex('Coupons', ['isActive']);
    await queryInterface.addIndex('Coupons', ['startsAt', 'expiresAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Coupons');
  }
};