import { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/category.services";

import { useAuth } from "@/hooks/useAuth";

/* 
  * Custom hook to manage categories
*/
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  /* 
  * Fetch all categories from the server
  */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* 
  * Add a new category
  @param {Object} categoryData - Data for the new category
  */
  const addCategory = async (categoryData) => {
    setLoading(true);
    try {
      const newCategory = await createCategory(categoryData, token);
      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* 
  * Remove a category by ID
  @param {string} categoryId - ID of the category to remove
  */
  const removeCategory = async (categoryId) => {
    setLoading(true);
    try {
      await deleteCategory(categoryId, token);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /*
  * Update category data
  @param {Object} categoryData - Updated category data
  */
  const updateCategoryData = async (categoryData) => {
    setLoading(true);
    try {
      const updatedCategory = await updateCategory(categoryData, token);
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === updatedCategory.id ? updatedCategory : cat
        )
      );
      return updatedCategory;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    removeCategory,
    updateCategoryData,
  };
};
