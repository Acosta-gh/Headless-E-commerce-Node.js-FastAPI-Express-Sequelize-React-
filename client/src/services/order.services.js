import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const ORDERS_URL = API_URL + "order";

// =====================
// User Order Services
// =====================

/**
 * Get all orders for logged-in user
 * GET /api/v1/order
 */
export const getUserOrders = async (token) => {
  const response = await axios.get(ORDERS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get specific order by ID (user's own order)
 * GET /api/v1/order/:orderId
 */
export const getOrderById = async (orderId, token) => {
  const response = await axios.get(`${ORDERS_URL}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Create new order
 * POST /api/v1/order
 */
export const createOrder = async (orderData, token) => {
  const response = await axios.post(ORDERS_URL, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Cancel order (user's own unpaid order)
 * POST /api/v1/order/:orderId/cancel
 */
export const cancelOrder = async (orderId, reason, token) => {
  const response = await axios.post(
    `${ORDERS_URL}/${orderId}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// =====================
// Admin Order Services
// =====================

/**
 * Get all orders (admin)
 * GET /api/v1/order/admin/all?status=&limit=&offset=
 */
export const getAllOrdersAdmin = async (token, { status, limit = 50, offset = 0 } = {}) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("limit", limit);
  params.append("offset", offset);

  const response = await axios.get(`${ORDERS_URL}/admin/all?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get order by ID (admin - any order)
 * GET /api/v1/order/admin/:orderId
 */
export const getOrderByIdAdmin = async (orderId, token) => {
  const response = await axios.get(`${ORDERS_URL}/admin/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Update payment status manually (admin)
 * PATCH /api/v1/order/:orderId/payment
 */
export const updatePaymentStatus = async (orderId, paymentStatus, note, token) => {
  const response = await axios.patch(
    `${ORDERS_URL}/${orderId}/payment`,
    { paymentStatus, note },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Update order status (admin)
 * PATCH /api/v1/order/:orderId/status
 */
export const updateOrderStatus = async (orderId, orderStatus, token) => {
  const response = await axios.patch(
    `${ORDERS_URL}/${orderId}/status`,
    { orderStatus },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Add tracking number (admin)
 * PATCH /api/v1/order/admin/:orderId/tracking
 */
export const addTrackingNumber = async (orderId, trackingNumber, carrierName, token) => {
  const response = await axios.patch(
    `${ORDERS_URL}/admin/${orderId}/tracking`,
    { trackingNumber, carrierName },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Add admin notes
 * PATCH /api/v1/order/admin/:orderId/notes
 */
export const addAdminNotes = async (orderId, adminNotes, token) => {
  const response = await axios.patch(
    `${ORDERS_URL}/admin/${orderId}/notes`,
    { adminNotes },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Cancel order (admin - any order)
 * POST /api/v1/order/admin/:orderId/cancel
 */
export const cancelOrderAdmin = async (orderId, reason, token) => {
  const response = await axios.post(
    `${ORDERS_URL}/admin/${orderId}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get order statistics (admin)
 * GET /api/v1/order/admin/stats
 */
export const getOrderStats = async (token) => {
  const response = await axios.get(`${ORDERS_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};