const { sequelize } = require("@/database/sequelize");

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos.");

    if (process.env.NODE_ENV === "test") {
      await sequelize.sync({ force: true });
      console.log("🔄 Base de datos en memoria sincronizada con Sequelize.");
    }
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
      console.log("🔄 Modelos sincronizados con Sequelize.");
    }
  } catch (error) {
    console.error("❌ Error al conectar la base de datos:", error);
    throw error;
  }
}

module.exports = { connectToDatabase };
