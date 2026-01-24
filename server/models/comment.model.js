const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize"); 

const Comment = sequelize.define(
  "Comment",
  {
    articleId: { // To which article the comment belongs
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    commentId: { // For nested comments
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: { // Who made the comment
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: { // The actual comment text
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enables soft deletes
  }
);

module.exports = { Comment };