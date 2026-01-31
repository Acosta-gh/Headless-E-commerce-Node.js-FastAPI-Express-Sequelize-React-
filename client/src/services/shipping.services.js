import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const SHIPPING_URL = API_URL + "shipping";

// =====================
// Public Shipping Services
// =====================

/**
 * Get available shipping methods for checkout
 * POST /api/v1/shipping/calculate
 */
export const getAvailableShippingMethods = async (shippingAddress, cartSubtotal, cartWeight = 0) => {
  const response = await axios.post(`${SHIPPING_URL}/calculate`, {
    shippingAddress,
    cartSubtotal,
    cartWeight,
  });
  return response.data;
};

/**
 * Calculate cost for specific shipping method
 * POST /api/v1/shipping/calculate/:methodId
 */
export const calculateShippingCost = async (methodId, shippingAddress, orderSubtotal, orderWeight = 0) => {
  const response = await axios.post(`${SHIPPING_URL}/calculate/${methodId}`, {
    shippingAddress,
    orderSubtotal,
    orderWeight,
  });
  return response.data;
};

/**
 * Validate if shipping method is available
 * POST /api/v1/shipping/validate/:methodId
 */
export const validateShippingMethod = async (methodId, shippingAddress, orderSubtotal, orderWeight = 0) => {
  const response = await axios.post(`${SHIPPING_URL}/validate/${methodId}`, {
    shippingAddress,
    orderSubtotal,
    orderWeight,
  });
  return response.data;
};

// =====================
// Admin Shipping Services
// =====================

/**
 * Get all shipping methods (admin - includes disabled)
 * GET /api/v1/shipping/admin/all
 */
export const getAllShippingMethodsAdmin = async (token) => {
  const response = await axios.get(`${SHIPPING_URL}/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get shipping method by ID (admin)
 * GET /api/v1/shipping/admin/:id
 */
export const getShippingMethodById = async (id, token) => {
  const response = await axios.get(`${SHIPPING_URL}/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Create new shipping method (admin)
 * POST /api/v1/shipping/admin
 */
export const createShippingMethod = async (methodData, token) => {
  const response = await axios.post(`${SHIPPING_URL}/admin`, methodData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Update shipping method (admin)
 * PATCH /api/v1/shipping/admin/:id
 */
export const updateShippingMethod = async (id, methodData, token) => {
  const response = await axios.patch(`${SHIPPING_URL}/admin/${id}`, methodData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Toggle shipping method status (admin)
 * PATCH /api/v1/shipping/admin/:id/toggle
 */
export const toggleShippingMethodStatus = async (id, token) => {
  const response = await axios.patch(`${SHIPPING_URL}/admin/${id}/toggle`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Delete/disable shipping method (admin)
 * DELETE /api/v1/shipping/admin/:id
 */
export const deleteShippingMethod = async (id, token) => {
  const response = await axios.delete(`${SHIPPING_URL}/admin/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};