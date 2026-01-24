const DataTypes = require("sequelize").DataTypes;
const { sequelize } = require("@/database/sequelize"); 

const Bookmark = sequelize.define(
  "Bookmark",
  {
    articleId: { // Which article is bookmarked
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: { // Who bookmarked the article
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { Bookmark };