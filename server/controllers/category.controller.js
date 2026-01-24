const categoryService = require("@/services/category.service");

async function createCategory(req, res) {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return res
      .status(500)
      .json({ error: "Error creating category: " + error.message });
  }
}

async function getAllCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ error: "Error fetching categories: " + error.message });
  }
}

async function getCategoryById(req, res) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res
      .status(500)
      .json({ error: "Error fetching category: " + error.message });
  }
}
async function deleteCategory(req, res) {
  try {
    const deleted = await categoryService.deleteCategory(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting category:", error);
    return res
      .status(500)
      .json({ error: "Error deleting category: " + error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const updatedCategory = await categoryService.updateCategory(
      req.params.id,
      req.body
    );
    if (!updatedCategory)
      return res.status(404).json({ error: "Category not found" });
    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json({ error: "Error updating category: " + error.message });
  }
} 


module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategory,
  updateCategory
};