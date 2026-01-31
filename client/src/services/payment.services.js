import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const PAYMENT_URL = API_URL + "payment";

// =====================
// Public
// =====================
/**
 * Get enabled payment methods (checkout)
 * GET /api/v1/payment
 */
export const getAvailablePaymentMethods = async () => {
  const response = await axios.get(PAYMENT_URL);
  return response.data;
};

// =====================
// Admin
// =====================
/**
 * Get ALL payment methods including disabled
 * GET /api/v1/payment/admin/all
 */
export const getAllPaymentMethodsAdmin = async (token) => {
  const response = await axios.get(`${PAYMENT_URL}/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get payment method by ID
 * GET /api/v1/payment/admin/:id
 */
export const getPaymentMethodById = async (id, token) => {
  const response = await axios.get(`${PAYMENT_URL}/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Create payment method
 * POST /api/v1/payment/admin
 */
export const createPaymentMethod = async (data, token) => {
  const response = await axios.post(`${PAYMENT_URL}/admin`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update payment method
 * PATCH /api/v1/payment/admin/:id
 */
export const updatePaymentMethod = async (id, data, token) => {
  const response = await axios.patch(`${PAYMENT_URL}/admin/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Toggle enabled/disabled
 * PATCH /api/v1/payment/admin/:id/toggle
 */
export const togglePaymentMethodStatus = async (id, token) => {
  const response = await axios.patch(`${PAYMENT_URL}/admin/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Delete (soft — disables)
 * DELETE /api/v1/payment/admin/:id
 */
export const deletePaymentMethod = async (id, token) => {
  const response = await axios.delete(`${PAYMENT_URL}/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};