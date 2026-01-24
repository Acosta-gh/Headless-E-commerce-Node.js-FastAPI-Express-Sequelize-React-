const DataTypes = require("sequelize");
const { sequelize } = require("@/database/sequelize"); 

const Like = sequelize.define(
  "Like",
  {
    articleId: { // Which article is liked
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commentId: { // Which comment is liked
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: { // Who liked the article
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { Like };