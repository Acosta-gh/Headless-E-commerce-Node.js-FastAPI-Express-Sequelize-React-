/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const {
  Article,
  User,
  Category,
  Like,
  Image,
  Comment,
  Subscriber,
} = require("@/models/index");

const { adoptTempImages } = require("@/utils/imageUtils");
const { transformArticle } = require("@/utils/dataTransformers");
const fs = require("fs");
const path = require("path");

const { newArticleNotification } = require("@/utils/templates/newArticleNotification");
const { sendEmail } = require("@/utils/emailUtils");

const createArticle = async (data) => {
  try {
    const { categoryIds, tempId, ...articleData } = data;

    console.log("💰 Price:", data.price, "📦 Stock:", data.stock);

    const article = await Article.create(articleData);

    if (Array.isArray(categoryIds)) {
      const categories = categoryIds.length
        ? await Category.findAll({ where: { id: categoryIds } })
        : [];
      await article.setCategories(categories);
    }

    await adoptTempImages(tempId, article.id);

    setImmediate(async () => {
      try {
        const subscribers = await Subscriber.findAll({ where: { verified: true } });
        const articleLink = `${process.env.FRONTEND_URL}/article/${article.id}`;
        const html = newArticleNotification(articleLink, article.title);

        for (const sub of subscribers) {
          await sendEmail(sub.email, "New Article Published!", html);
        }
      } catch (error) {
        console.error("Error sending article notifications:", error);
      }
    });

    return article.get({ plain: true });
  } catch (error) {
    console.error("Error sending article notifications:", error);
  }
};

const getAllArticles = async () => {
  try {
    const articles = await Article.findAll({
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        { model: Image, as: "images", attributes: ["id", "url", "type"] },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
          where: { commentId: null },
          required: false,
        },
        { model: Category, as: "categories", attributes: ["id", "name"] },
      ],
    });

    const plainArticles = articles.map(a => a.get({ plain: true }));
    return transformArticle(plainArticles);
  } catch (error) {
    throw new Error("Error fetching articles: " + error.message);
  }
};

const getArticleById = async (id) => {
  try {
    const article = await Article.findByPk(id, {
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        { model: Image, as: "images", attributes: ["id", "url"] },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
          where: { commentId: null },
          required: false,
        },
        { model: Category, as: "categories", attributes: ["id", "name"] },
      ],
    });

    if (!article) throw new Error("Article not found");

    return transformArticle(article.get({ plain: true }));
  } catch (error) {
    throw new Error("Error fetching article: " + error.message);
  }
};

const getArticleBySlug = async (slug) => {
  try {
    const article = await Article.findOne({
      where: { slug: slug },
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        { model: Image, as: "images", attributes: ["id", "url"] },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
          where: { commentId: null },
          required: false,
        },
        { model: Category, as: "categories", attributes: ["id", "name"] },
      ],
    });

    if (!article) throw new Error("Article not found");

    return transformArticle(article.get({ plain: true }));
  } catch (error) {
    throw new Error("Error fetching article: " + error.message);
  }
};


const updateArticle = async (id, data) => {
  try {
    const article = await Article.findByPk(id);
    if (!article) throw new Error("Article not found");

    const { categoryIds, ...articleData } = data;
    await article.update(articleData);

    if (Array.isArray(categoryIds)) {
      const categories = categoryIds.length
        ? await Category.findAll({ where: { id: categoryIds } })
        : [];
      await article.setCategories(categories);
    }

    return article.get({ plain: true });
  } catch (error) {
    throw new Error("Error updating article: " + error.message);
  }
};

const deleteArticle = async (id) => {
  if (!id) throw new Error("Article ID is required");

  try {
    const article = await Article.findByPk(id);
    if (!article) throw new Error("Article not found");

    const comments = await Comment.findAll({ where: { articleId: id } });
    for (const c of comments) {
      await c.destroy();
    }

    await Like.destroy({ where: { articleId: id, commentId: null } });

    await article.setCategories([]);

    const images = await Image.findAll({ where: { articleId: id } });
    for (const img of images) {
      try {
        await fs.promises.unlink(path.join(__dirname, "../uploads", path.basename(img.url)));
      } catch (err) {
        console.error("Error deleting image:", err);
      }
      await img.destroy();
    }

    if (article.banner) {
      try {
        await fs.promises.unlink(path.join(__dirname, "../uploads", path.basename(article.banner)));
      } catch (err) {
        console.error("Error deleting banner image:", err);
      }
    }

    await article.destroy();

    return { success: true, message: "Article deleted" };
  } catch (error) {
    throw new Error("Error deleting article: " + error.message);
  }
};


module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticleBySlug
};
