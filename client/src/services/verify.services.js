import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const VERIFY_URL = API_URL + "verify";

/** Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Verification result
 * @throws {Error} Network or server error
 */
export const verifyEmail = async (token) => {
  const response = await axios.post(`${VERIFY_URL}`, null, {
    params: { token },
  });
  return response.data;
};

export const verifyEmailSubscriber  = async (token) => {
  const response = await axios.post(`${VERIFY_URL}/subscriber`, null, {
    params: { token },
  });
  return response.data;
};

/** Resend verification email
 * @param {string} email - User email
 * @returns {Promise<Object>} Resend result
 * @throws {Error} Network or server error
 */
export const resendVerificationEmail = async (email) => {
  const response = await axios.post(`${VERIFY_URL}/resend`, { email });
  return response.data;
};