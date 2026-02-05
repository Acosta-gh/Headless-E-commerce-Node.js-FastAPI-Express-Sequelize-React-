'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Likes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Articles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Unique constraint: user can like article OR comment only once
    await queryInterface.addIndex('Likes', ['userId', 'articleId'], {
      unique: true,
      where: {
        articleId: { [Sequelize.Op.ne]: null }
      },
      name: 'unique_user_article_like'
    });

    await queryInterface.addIndex('Likes', ['userId', 'commentId'], {
      unique: true,
      where: {
        commentId: { [Sequelize.Op.ne]: null }
      },
      name: 'unique_user_comment_like'
    });

    await queryInterface.addIndex('Likes', ['articleId']);
    await queryInterface.addIndex('Likes', ['commentId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Likes');
  }
};