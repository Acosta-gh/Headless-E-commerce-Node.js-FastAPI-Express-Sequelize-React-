module.exports = {
  async up(queryInterface, Sequelize) {
    const items = [
      {
        slug: "producto-test-ficticio-demo",
        title: "PRODUCTO DE PRUEBA - NO REAL",
        authorId: 1,
        content: "Este es un producto ficticio creado únicamente para pruebas de desarrollo. No existe en la realidad y no está disponible para venta.",
        price: 1.00,
        stock: 999,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const item of items) {
      try {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM articles WHERE slug = :slug LIMIT 1`,
          {
            replacements: { slug: item.slug },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (!existing) {
          await queryInterface.bulkInsert("articles", [item]);
          console.log(`✅ Inserted test item: ${item.slug}`);
        } else {
          console.log(`⚠️  Test item already exists: ${item.slug}`);
        }
      } catch (error) {
        console.log(`❌ Error inserting item ${item.slug}:`, error.message);
        console.log(`⏭️  Continuing with next item...`);
      }
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.bulkDelete("articles", {
        slug: "producto-test-ficticio-demo",
      });
      console.log("🗑️  Test item removed");
    } catch (error) {
      console.log("⚠️  Error removing test item:", error.message);
    }
  },
};