require('dotenv').config();

const path = require("path");
const dbDir = path.resolve(__dirname, "../db");
const dbPath = path.join(dbDir, "database.sqlite");


if (dbDir && !require("fs").existsSync(dbDir)) {
  require("fs").mkdirSync(dbDir);
}

console.log('DATABASE:', process.env.DB_NAME);
console.log('USER:', process.env.DB_USER);
console.log('HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.DB_PORT);
console.log('DIALECT:', process.env.DB_DIALECT);

// Database configurations for different environments
module.exports = {
  development: {
    dialect: "sqlite",
    storage: dbPath,
    logging: console.log,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: console.log,
  },
  production: {
    dialect: process.env.DB_DIALECT || "postgres",
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    logging: false,
  },
};
