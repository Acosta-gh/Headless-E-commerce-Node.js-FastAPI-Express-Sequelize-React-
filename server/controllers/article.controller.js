/*
 * ========================================================================================
 * ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
 * ========================================================================================
 */

const articleService = require("@/services/article.service");

async function createArticle(req, res) {
  const authorId = req.user.id;

  // Parse categoryIds from request body
  let categoryIds = [];
  // If categoryIds is sent as a JSON string, parse it
  if (req.body.categoryIds) {
    // Parse the JSON string into an array
    categoryIds =
      typeof req.body.categoryIds === "string"
        ? JSON.parse(req.body.categoryIds)
        : req.body.categoryIds;
  }

  try {
    let bannerPath = null;
    if (req.file) {
      bannerPath = `/uploads/${req.file.filename}`;
    }

    const { title, content, tempId, featured, stock, price, sku } = req.body;

    // Convert featured to booalean in case it's sent as a string because of form data
    const isFeatured = featured === "true" || featured === true;

    const article = await articleService.createArticle({
      authorId,
      title,
      content,
      banner: bannerPath,
      tempId,
      sku,
      featured: isFeatured,
      stock: Number(stock),
      price: Number(price),
      categoryIds,
    });
    return res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    return res
      .status(500)
      .json({ error: "Error creating article: " + error.message });
  }
}
async function getAllArticles(req, res) {
  const articles = await articleService.getAllArticles();
  return res.status(200).json(articles);
}

async function getArticleBySlug(req, res) {
  const article = await articleService.getArticleBySlug(req.params.slug);
  if (!article) return res.status(404).json({ error: "Article not found" });
  return res.status(200).json(article);
}

async function getArticleById(req, res) {
  const article = await articleService.getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  return res.status(200).json(article);
}

async function updateArticle(req, res) {
  console.log("Updating article with req.body:", req.body);
  console.log("Updating article with req.file:", req.file);
  try {
    const authorId = req.user.id;

    const { title, content, categoryIds, featured, stock, price } = req.body;

    // Convert featured to boolean
    const isFeatured = featured === "true" || featured === true;

    // Parse categoryIds
    const parsedCategoryIds =
      typeof categoryIds === "string" ? JSON.parse(categoryIds) : categoryIds;

    let bannerPath = null;
    if (req.file) {
      bannerPath = `/uploads/${req.file.filename}`;
    } else if (req.body.existingBanner) {
      bannerPath = req.body.existingBanner;
    }

    const article = await articleService.updateArticle(req.params.id, {
      authorId,
      title,
      content,
      banner: bannerPath,
      featured: isFeatured,
      stock: Number(stock),
      price: Number(price),
      categoryIds: parsedCategoryIds,
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    return res.status(200).json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: "Error updating article: " + error.message });
    }
  }
}

async function deleteArticle(req, res) {
  const deleted = await articleService.deleteArticle(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Article not found" });
  return res.status(204).send();
}

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticleBySlug,
};
