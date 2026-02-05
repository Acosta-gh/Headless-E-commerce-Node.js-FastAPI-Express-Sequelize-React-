'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER, // CORREGIDO: era UUID, debe ser INTEGER
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subscriberId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Subscribers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tokenHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM('password_reset', 'email_verify'),
        allowNull: false,
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('Tokens', ['tokenHash']);
    await queryInterface.addIndex('Tokens', ['userId']);
    await queryInterface.addIndex('Tokens', ['subscriberId']);
    await queryInterface.addIndex('Tokens', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tokens');
  }
};