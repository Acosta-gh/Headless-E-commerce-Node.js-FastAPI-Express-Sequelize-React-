const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const Subscriber = sequelize.define(
  "Subscriber",
  {
    email: {
      // Email of the suscriber
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paid: {
      // Whether the suscriber has paid
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verified: {
      // Whether the suscriber has verified their email
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { Subscriber };
