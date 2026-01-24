const DataTypes = require("sequelize").DataTypes;
const { sequelize } = require("@/database/sequelize");

const TempId = sequelize.define(
  "TempId",
  {
    tempId: {
      // Temporary ID for associating images before article creation
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      // User who owns this temp ID
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      // Timestamp of creation
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = { TempId };
