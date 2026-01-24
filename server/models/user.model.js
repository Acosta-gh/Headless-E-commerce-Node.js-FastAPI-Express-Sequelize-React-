// models/user.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const User = sequelize.define(
  "User",
  {
    username: {
      // Unique username
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      // User's email address
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      // Hashed password
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      // Whether the user is verified
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    admin: {
      // Whether the user has admin privileges
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Whether the user has employee privileges
    employee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    banned: {
      // Whether the user is banned
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enables soft deletes
  }
);

module.exports = { User };
