import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const SUBSCRIBE_URL = API_URL + "subscriber";

/*
 * Subscribe an email to the newsletter
 * @param {string} email - Email address to subscribe
 * @returns {Promise<Object>} Subscription response data
 * @throws {Error} Network or server error
 */
export const toggleSubscribe = async (email) => {
  const response = await axios.post(SUBSCRIBE_URL, { email });
  console.log("toggleSubscribe response data:", response.data);
  return response.data;
};
