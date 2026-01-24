import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const LIKE_URL = API_URL + "like";

/** Create or undo a like for an article
 * @param {number} articleId - ID of the article to like or unlike
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} Updated like data
 * @throws {Error} Network or server error
 */
export const toggleLike = async (articleId, commentId, token) => {
  //console.log("toggleLike called with:", { articleId, commentId, token });
  const response = await axios.post(
    LIKE_URL,
    { articleId, commentId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  //console.log("toggleLike response data:", response.data);
  return response.data;
};

