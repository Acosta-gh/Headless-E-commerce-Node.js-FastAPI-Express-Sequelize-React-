// seeders/20260204-seed-article.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const article = {
      authorId: 1, // Asegúrate de que exista un usuario con id 1
      title: "Producto de prueba - Cash Order",
      featured: false,
      banner: null,
      content: "Este es un artículo de prueba para testing de seeders.",
      tempId: null,
      sku: "TEST-SKU-001",
      slug: "producto-test-cash",
      price: 1000.00,
      stock: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const existing = await queryInterface.sequelize.query(
        `SELECT id FROM "Articles" WHERE slug = :slug LIMIT 1`,
        { replacements: { slug: article.slug }, type: Sequelize.QueryTypes.SELECT }
      );

      if (!existing.length) {
        await queryInterface.bulkInsert('Articles', [article]);
        console.log(`✅ Article inserted: ${article.slug}`);
      } else {
        console.log(`⚠️ Article already exists: ${article.slug}`);
      }
    } catch (error) {
      console.log(`❌ Error inserting article: ${error.message}`);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Articles', { slug: "producto-test-cash" });
    console.log(`🗑️ Article removed: producto-test-cash`);
  },
};
