const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");
const slugify = require("slugify");

const Article = sequelize.define(
  "Article",
  {
    authorId: {
      // Who wrote the article
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      // Title of the article
      type: DataTypes.STRING,
      allowNull: false,
    },
    featured: {
      // Is the article featured?
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    banner: {
      // URL of the banner image
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      // Main content of the article
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tempId: {
      // Temporary ID for associating images before article creation
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // ej: 99999999.99
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeValidate: (article) => {
        if (article.title && !article.slug) {
          article.slug = slugify(article.title, {
            lower: true,
            strict: true,
          });
        }
      },
    },
  }
);

module.exports = { Article };
