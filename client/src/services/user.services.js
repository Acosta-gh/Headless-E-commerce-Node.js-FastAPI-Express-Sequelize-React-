import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const USER_URL = API_URL + "user";

/** Fetch all users
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} List of users
 * @throws {Error} Network or server error
 */
export const getAllUsers = async (token) => {
  const response = await axios.get(USER_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/** Fetch user data by ID
 * @param {string} userId - ID of the user to fetch
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} User data
 * @throws {Error} Network or server error
 */
export const getUserById = async (userId, token) => {
  const response = await axios.get(`${USER_URL}/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/** Update user data
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - Data to update
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} Network or server error
 */
export const updateUser = async (userId, userData, token) => {
  const response = await axios.put(`${USER_URL}/${userId}`, userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/** Delete user by ID
 * @param {string} userId - ID of the user to delete
 * @param {string} token - Authorization token
 * @returns {Promise<void>}
 * @throws {Error} Network or server error
 */
export const deleteUser = async (userId, token) => {
  await axios.delete(`${USER_URL}/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};  
