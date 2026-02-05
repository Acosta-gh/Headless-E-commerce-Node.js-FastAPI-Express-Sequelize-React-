import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const ORDER_URL = API_URL + "order";

// =====================
// User Order Services
// =====================

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Created order
 * @throws {Error} Network or server error
 */
export const createOrder = async (orderData, token) => {
  const response = await axios.post(ORDER_URL, orderData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

/**
 * Get all orders for logged-in user
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} List of user orders
 * @throws {Error} Network or server error
 */
export const getUserOrders = async (token) => {
  const response = await axios.get(ORDER_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Get specific order by ID (user's own order)
 * @param {string} orderId - Order ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Order data
 * @throws {Error} Network or server error
 */
export const getOrderById = async (orderId, token) => {
  const response = await axios.get(`${ORDER_URL}/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Cancel order (user's own order)
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Cancelled order
 * @throws {Error} Network or server error
 */
export const cancelOrder = async (orderId, reason, token) => {
  const response = await axios.post(
    `${ORDER_URL}/${orderId}/cancel`,
    { reason },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// =====================
// Admin Order Services
// =====================

/**
 * Get all orders (admin)
 * @param {string} token - Authorization token
 * @param {Object} params - Query params (status, limit, offset)
 * @returns {Promise<Object>} Orders with pagination
 * @throws {Error} Network or server error
 */
export const getAllOrders = async (token, params = {}) => {
  const response = await axios.get(`${ORDER_URL}/admin/all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params
  });
  return response.data;
};

/**
 * Get order by ID (admin - any order)
 * @param {string} orderId - Order ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Order data
 * @throws {Error} Network or server error
 */
export const getOrderByIdAdmin = async (orderId, token) => {
  const response = await axios.get(`${ORDER_URL}/admin/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

/**
 * Update payment status manually (admin)
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - { paymentStatus, note }
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Updated order
 * @throws {Error} Network or server error
 */
export const updatePaymentManually = async (orderId, paymentStatus, note, token) => {
  console.log("token", token);

  const response = await axios.patch(
    `${ORDER_URL}/${orderId}/payment`,
    { paymentStatus, note },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

/**
 * Update order status manually (admin)
 * @param {string} orderId - Order ID
 * @param {Object} statusData - { orderStatus }
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Updated order
 * @throws {Error} Network or server error
 */
export const updateOrderStatus = async (orderId, orderStatus, token) => {
  const response = await axios.patch(
    `${ORDER_URL}/${orderId}/status`,
    { orderStatus },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

/**
 * Add tracking number (admin)
 * @param {string} orderId - Order ID
 * @param {Object} trackingData - { trackingNumber, carrierName }
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Updated order
 * @throws {Error} Network or server error
 */
export const addTrackingNumber = async (orderId, trackingNumber, carrierName, token) => {
  const response = await axios.patch(
    `${ORDER_URL}/admin/${orderId}/tracking`,
    {
      trackingNumber,
      carrierName
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

/**
 * Add admin notes to order
 * @param {string} orderId - Order ID
 * @param {Object} notesData - { adminNotes }
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Updated order
 * @throws {Error} Network or server error
 */
export const addAdminNotes = async (orderId, adminNotes, token) => {
  const response = await axios.patch(
    `${ORDER_URL}/admin/${orderId}/notes`,
    { adminNotes },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

/**
 * Cancel order (admin - any order)
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Cancelled order
 * @throws {Error} Network or server error
 */
export const cancelOrderAdmin = async (orderId, reason, token) => {
  const response = await axios.post(
    `${ORDER_URL}/admin/${orderId}/cancel`,
    { reason },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// =====================
// Statistics Services
// =====================

/**
 * Get order statistics (admin)
 * @param {string} token - Authorization token
 * @param {Object} params - Query params (period, startDate, endDate)
 * @returns {Promise<Object>} Statistics data
 * @throws {Error} Network or server error
 */
export const getOrderStats = async (token, params = {}) => {
  const response = await axios.get(`${ORDER_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params
  });
  return response.data;
};

/**
 * Export statistics to CSV (admin)
 * @param {string} token - Authorization token
 * @param {Object} params - Query params (startDate, endDate)
 * @returns {Promise<Blob>} CSV file
 * @throws {Error} Network or server error
 */
export const exportStatsToCSV = async (token, params = {}) => {
  const response = await axios.get(`${ORDER_URL}/admin/stats/export/csv`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Export statistics to PDF (admin)
 * @param {string} token - Authorization token
 * @param {Object} params - Query params (period)
 * @returns {Promise<Blob>} PDF file
 * @throws {Error} Network or server error
 */
export const exportStatsToPDF = async (token, params = {}) => {
  const response = await axios.get(`${ORDER_URL}/admin/stats/export/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    params,
    responseType: 'blob'
  });
  return response.data;
};

// =====================
// Webhook Services
// =====================

/**
 * Update payment from webhook
 * @param {string} orderId - Order ID
 * @param {Object} webhookData - Webhook payload
 * @param {string} webhookSecret - Webhook secret
 * @returns {Promise<Object>} Updated order
 * @throws {Error} Network or server error
 
export const updatePaymentFromWebhook = async (orderId, webhookData, webhookSecret) => {
  const response = await axios.patch(
    `${ORDER_URL}/${orderId}/payment/webhook`,
    webhookData,
    {
      headers: {
        'X-Webhook-Secret': webhookSecret,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};
*/