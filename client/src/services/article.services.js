/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const ARTICLES_URL = API_URL + "article";

/**
 * Fetch all articles
 * @returns {Promise<Array>} List of articles
 * @throws {Error} Network or server error
 */
export const getArticles = async () => {
  const response = await axios.get(ARTICLES_URL);
  return response.data;
};

/**
 *  Fetch article by ID
 *  @param {string} id - Article ID
 *  @returns {Promise<Object>} Article data
 *  @throws {Error} Network or server error
 */
export const getArticleById = async (id) => {
  const response = await axios.get(`${ARTICLES_URL}/${id}`);
  return response.data;
};

/** Create a new article
 * @param {Object} articleData - Article data
 * @param {string} tempIdToken - Temporary ID to associate the article with image uploads
 * @returns {Promise<Object>} Created article data
 * @throws {Error} Network or server error
 */
export const createArticle = async (articleData, tempIdToken, token) => {
  const response = await axios.post(ARTICLES_URL, articleData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-tempid-token": tempIdToken, 
    },
  });
  return response.data;
};

/** Update an existing article
 * @param {string} id - Article ID
 * @param {Object} articleData - Updated article data
 * @returns {Promise<Object>} Updated article data
 * @throws {Error} Network or server error
 */
export const updateArticle = async (id, articleData, tempIdToken, token) => {
  const response = await axios.put(`${ARTICLES_URL}/${id}`, articleData, {
    headers: {
       Authorization: `Bearer ${token}`,
      "x-tempid-token": tempIdToken,
    },
  });
  return response.data;
};

/** Delete an article
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Deletion result
 * @throws {Error} Network or server error
 */
export const deleteArticle = async (id,token) => {
  const response = await axios.delete(`${ARTICLES_URL}/${id}`,{
    headers: {  
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
