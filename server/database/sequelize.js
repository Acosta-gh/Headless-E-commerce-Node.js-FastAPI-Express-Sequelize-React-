// server/database/sequelize.js
require('dotenv').config();

const { Sequelize } = require('sequelize');
const config = require('@/config/config')[process.env.NODE_ENV || 'development'];

// Create a new Sequelize instance with the database configuration

const sequelize = new Sequelize(config);

module.exports = { sequelize };
