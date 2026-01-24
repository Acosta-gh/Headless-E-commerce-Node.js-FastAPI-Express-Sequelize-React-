import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const AUTH_URL = `${API_URL}auth`;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Response data
 * @throws {Error} Network or server error
 */
export const register = async (userData) => {
  const response = await axios.post(`${AUTH_URL}/register`, userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} Response data with token
 * @throws {Error} Network or server error
 */
export const login = async (credentials) => {
  const response = await axios.post(`${AUTH_URL}/login`, credentials);
  console.log(response.data);
  return response.data;
};

export const forgot = async (email) => {
  const response = await axios.post(`${AUTH_URL}/forgot-password`, email);
  return response.data;
};

export const reset = async ({ token, password }) => {
  const response = await axios.post(`${AUTH_URL}/reset-password`, {
    token,
    password,
  });

  return response.data;
};
