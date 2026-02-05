'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CouponUsages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      couponId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Coupons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
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
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      discountAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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

    await queryInterface.addIndex('CouponUsages', ['couponId', 'userId']);
    await queryInterface.addIndex('CouponUsages', ['orderId'], { unique: true });
    await queryInterface.addIndex('CouponUsages', ['couponId']);
    await queryInterface.addIndex('CouponUsages', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CouponUsages');
  }
};