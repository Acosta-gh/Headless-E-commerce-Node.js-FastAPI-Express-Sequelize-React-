'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipping_methods', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      baseCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 15000,
      },
      rules: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      icon: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      estimatedDaysMin: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      estimatedDaysMax: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      carrierName: {
        type: Sequelize.STRING(100),
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

    await queryInterface.addIndex('shipping_methods', ['code'], { unique: true });
    await queryInterface.addIndex('shipping_methods', ['enabled']);
    await queryInterface.addIndex('shipping_methods', ['displayOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipping_methods');
  }
};