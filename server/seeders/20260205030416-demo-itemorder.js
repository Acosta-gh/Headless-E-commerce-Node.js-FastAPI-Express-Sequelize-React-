'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Buscamos la orden de demo (cash)
      const orders = await queryInterface.sequelize.query(
        `SELECT id FROM "Orders" WHERE "customerEmail" = :email LIMIT 1`,
        {
          replacements: { email: 'cliente@testing.com' },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      // Buscamos el artículo de demo
      const articles = await queryInterface.sequelize.query(
        `SELECT id, title, sku, banner, price FROM "Articles" WHERE "slug" = :slug LIMIT 1`,
        {
          replacements: { slug: 'producto-test-cash' },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!orders.length || !articles.length) {
        console.log('⚠️  No se encontró orden o artículo de demo para crear OrderItem.');
        return;
      }

      const order = orders[0];
      const article = articles[0];

      const orderItem = {
        orderId: order.id,
        productId: article.id,
        title: article.title,
        description: 'Producto de prueba incluido en orden cash',
        sku: article.sku,
        imageUrl: article.banner || null,
        quantity: 2,
        unitPrice: article.price,
        subtotal: (article.price * 2).toFixed(2),
        productVariant: null,
        notes: 'Orden demo de pago en efectivo',
        isRefunded: false,
        refundedQuantity: 0,
        refundedAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await queryInterface.bulkInsert('OrderItems', [orderItem]);
      console.log('✅ OrderItem demo insertado correctamente.');
    } catch (error) {
      console.error('❌ Error insertando OrderItem demo:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkDelete('OrderItems', {
        notes: 'Orden demo de pago en efectivo',
      });
      console.log('🗑️ OrderItem demo eliminado.');
    } catch (error) {
      console.error('⚠️ Error eliminando OrderItem demo:', error.message);
    }
  },
};
