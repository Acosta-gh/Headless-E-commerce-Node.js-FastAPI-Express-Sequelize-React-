require("dotenv").config();
require("module-alias/register");

require('@/tasks/cleanupImages'); // Import the cleanup task
const { User } = require("@/models/index"); // Import User model

const app = require("./app");
const { connectToDatabase } = require("@/services/database.service");

const PORT = process.env.PORT || 3001;
const URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

(async () => {
  try {
    await connectToDatabase();
    // Ensure the admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "123";
    const adminUser = await User.findOne({ where: { email: adminEmail } });
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

    if (!adminUser) {
      await User.create({
        username: "admin",
        email: adminEmail,
        password: await require("bcrypt").hash(adminPassword, saltRounds),
        admin: true,
        verified: true,
      });
      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️  Admin user already exists");
    }
    app.listen(PORT, () =>
      console.log(`🚀 Server is running at ${URL || `http://localhost:${PORT}`}`)
    );
  } catch (error) {
    console.error("💥 The server failed to start:", error);
    process.exit(1);
  }
})();
