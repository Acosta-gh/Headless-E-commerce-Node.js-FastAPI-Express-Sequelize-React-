import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const COUPONS_URL = API_URL + "coupon";

// =====================
// Public Coupon Services
// =====================

/**
 * Validate coupon code (public - for checkout preview)
 * GET /api/v1/coupon/validate/:code
 */
export const validateCouponCode = async (code) => {
  const response = await axios.get(`${COUPONS_URL}/validate/${code}`);
  return response.data;
};

// =====================
// Admin Coupon Services
// =====================

/**
 * Get all coupons (admin)
 * GET /api/v1/coupon?isActive=&discountType=
 */
export const getAllCoupons = async (token, { isActive, discountType } = {}) => {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append("isActive", isActive);
  if (discountType) params.append("discountType", discountType);

  const queryString = params.toString();

  const response = await axios.get(
    `${COUPONS_URL}${queryString ? `?${queryString}` : ""}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

/**
 * Get coupon by ID (admin)
 * GET /api/v1/coupon/:id
 */
export const getCouponById = async (id, token) => {
  const response = await axios.get(`${COUPONS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Get coupon statistics (admin)
 * GET /api/v1/coupon/:id/stats
 */
export const getCouponStats = async (id, token) => {
  const response = await axios.get(`${COUPONS_URL}/${id}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Create new coupon (admin)
 * POST /api/v1/coupon
 */
export const createCoupon = async (couponData, token) => {
  const response = await axios.post(`${COUPONS_URL}`, couponData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Update coupon (admin)
 * PUT /api/v1/coupon/:id
 */
export const updateCoupon = async (id, couponData, token) => {
  const response = await axios.put(`${COUPONS_URL}/${id}`, couponData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Toggle coupon active status (admin)
 * PATCH /api/v1/coupon/:id/toggle
 */
export const toggleCouponStatus = async (id, token) => {
  const response = await axios.patch(`${COUPONS_URL}/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Delete coupon (admin)
 * DELETE /api/v1/coupon/:id
 */
export const deleteCoupon = async (id, token) => {
  const response = await axios.delete(`${COUPONS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};