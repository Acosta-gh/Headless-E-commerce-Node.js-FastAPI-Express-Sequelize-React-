  const { DataTypes } = require("sequelize");
  const { sequelize } = require("@/database/sequelize");

  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Enables soft deletes
    }
  );

  module.exports = { Category };
