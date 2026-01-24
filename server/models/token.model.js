const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const Token = sequelize.define(
  "Token",
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    subscriberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    type: {
      type: DataTypes.ENUM("password_reset", "email_verify"),
      allowNull: false,
    },

    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
    tableName: "Tokens",
  },
);

module.exports = { Token };
