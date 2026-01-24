import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const USER_URL = API_URL + "user";

/** Fetch user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 * @throws {Error} Network or server error
 * @param {string} token - Authorization token
 */
export const getProfile = async (userId, token) => {
  console.log("Fetching profile for user ID:", userId);
  const response = await axios.get(`${USER_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/** Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user profile data
 * @throws {Error} Network or server error
 */
export const updateUserProfile = async (userId, profileData, token) => {
  const response = await axios.put(`${USER_URL}/${userId}`, profileData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/** Delete user profile
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} Network or server error
 */
export const deleteUserProfile = async (userId) => {
  const response = await axios.delete(USER_URL + userId);
  return response.data;
};
