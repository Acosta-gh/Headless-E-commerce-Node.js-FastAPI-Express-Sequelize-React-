const { Category } = require("@/models/category.model");

const createCategory = async (data) => {
  try {
    const category = await Category.create(data);
    return category;
  } catch (error) {
    throw new Error("Error creating category: " + error.message);
  }
};

const updateCategory = async (id, data) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await category.update(data);
    return category;
  } catch (error) {
    throw new Error("Error updating category: " + error.message);
  }
};

const deleteCategory = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    await category.destroy();
    return true;
  } catch (error) {
    throw new Error("Error deleting category: " + error.message);
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw new Error("Error fetching category: " + error.message);
  }
};

const getAllCategories = async () => {
  try {
    const categories = await Category.findAll();
    return categories;
  } catch (error) {
    throw new Error("Error fetching categories: " + error.message);
  }
};

module.exports = {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
};
