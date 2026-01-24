const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize"); 

const Image = sequelize.define(
  "Image",
  {
    articleId: { // Associated article
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tempId: { // Temporary ID before associating with an article
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: { // URL of the image
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { Image };