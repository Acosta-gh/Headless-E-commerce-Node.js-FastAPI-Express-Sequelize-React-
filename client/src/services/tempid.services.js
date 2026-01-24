import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const TEMPID_URL = API_URL + "tempid/";

/** Generate a new temporary ID
 * @returns {Promise<Object>} Object containing tempId and tempIdToken
 * @throws {Error} Network or server error
 */
export const generateTempId = async (token) => { 
  const response = await axios.get(TEMPID_URL,{
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
