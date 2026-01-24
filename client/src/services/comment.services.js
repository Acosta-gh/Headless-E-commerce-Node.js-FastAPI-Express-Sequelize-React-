import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const COMMENT_URL = API_URL + "comment";

/** Fetch comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>} Comment data
 * @throws {Error} Network or server error
 */
export const getComments = async (commentId) => {
  const response = await axios.get(`${COMMENT_URL}/${commentId}`);
  return response.data;
};

/** Create a new comment
 * @param {Object} commentData - Comment data
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Created comment data
 * @throws {Error} Network or server error
 */
export const createComment = async (commentData, token) => {
  const response = await axios.post(COMMENT_URL, commentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/** Delete a comment
 * @param {string} commentId - Comment ID
 * @param {string} token - JWT token for authentication
 * @returns {Promise<void>}
 * @throws {Error} Network or server error
 */
export const deleteComment = async (commentId, token) => {
  await axios.delete(`${COMMENT_URL}/${commentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/** Fetch all comments for a specific article
 * @param {string} articleId - Article ID
 * @returns {Promise<Array>} List of comments
 * @throws {Error} Network or server error
 */
export const getAllCommentsByArticleId = async (articleId) => {
  const response = await axios.get(COMMENT_URL, { params: { articleId } });
  console.log("Response data in getAllCommentsByArticleId:", response.data);
  return response.data;
};
