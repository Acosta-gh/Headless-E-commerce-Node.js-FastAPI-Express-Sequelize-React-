import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const CATEGORY_URL = API_URL + "category";

/** Fetch all categories
 * @returns {Promise<Array>} List of categories
 * @throws {Error} Network or server error
 */
export const getCategories = async () => {
  const response = await axios.get(CATEGORY_URL);
  return response.data;
};

/** Create a new category
 * @param {Object} categoryData - Category data
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Created category data
 * @throws {Error} Network or server error
 */
export const createCategory = async (categoryData, token) => {
  const response = await axios.post(CATEGORY_URL, categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/** Update an existing category
 * @param {Object} categoryData - Updated category data
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Updated category data
 * @throws {Error} Network or server error
 */
export const updateCategory = async (categoryData, token) => {
  const response = await axios.put(`${CATEGORY_URL}/${categoryData.id}`, categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/** Delete a category
 * @param {number} categoryId - ID of the category to delete
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 * @throws {Error} Network or server error
 */
export const deleteCategory = async (categoryId, token) => {
  await axios.delete(`${CATEGORY_URL}/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
