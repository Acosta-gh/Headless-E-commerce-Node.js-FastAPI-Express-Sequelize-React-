const express = require("express");
const router = express.Router();
const { genericLimiter } = require("@/middlewares/rateLimit.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyWebhookSecret } = require("@/middlewares/verifyWebhookSecret.middleware");

const {
  createOrder,
  getOrdersByUserId,
  getOrderById,
  cancelOrderById,
  updatePaymentFromWebhook,
  updatePaymentManually,
  updateOrderStatusManually,
  getAllOrders,
  getOrderByIdAdmin,
  addTrackingNumber,
  addAdminNotes,
  cancelOrderByIdAdmin,
  getOrderStats,
  exportStatsToCSV,
  exportStatsToPDF,
} = require("@/controllers/order.controller");

// =====================
// Webhook Routes (no authentication - validated by webhook secret)
// =====================
/**
 * MercadoPago webhook - update payment status
 * PATCH /api/v1/order/:orderId/payment/webhook
 */
router.patch("/:orderId/payment/webhook", verifyWebhookSecret, updatePaymentFromWebhook);

// =====================
// Admin Routes
// =====================
/**
 * Get all orders (admin)
 * GET /api/v1/order/admin/all?status=&limit=50&offset=0
 */
router.get("/admin/all", verifyJWT, isAdmin, genericLimiter, getAllOrders);

/**
 * Get order statistics (admin)
 * GET /api/v1/order/admin/stats?period=30d&startDate=2024-01-01&endDate=2024-12-31
 */
router.get("/admin/stats", verifyJWT, isAdmin, genericLimiter, getOrderStats);

/**
 * Export statistics to CSV (admin)
 * GET /api/v1/order/admin/stats/export/csv?startDate=2024-01-01&endDate=2024-12-31
 */
router.get("/admin/stats/export/csv", verifyJWT, isAdmin, genericLimiter, exportStatsToCSV);

/**
 * Export statistics to PDF (admin)
 * GET /api/v1/order/admin/stats/export/pdf?period=30d
 */
router.get("/admin/stats/export/pdf", verifyJWT, isAdmin, genericLimiter, exportStatsToPDF);

/**
 * Get order by ID (admin - any order)
 * GET /api/v1/order/admin/:orderId
 */
router.get("/admin/:orderId", verifyJWT, isAdmin, genericLimiter, getOrderByIdAdmin);

/**
 * Update payment status manually (admin)
 * PATCH /api/v1/order/:orderId/payment
 */
router.patch("/:orderId/payment", verifyJWT, isAdmin, updatePaymentManually);

/**
 * Update order status (admin)
 * PATCH /api/v1/order/:orderId/status
 */
router.patch("/:orderId/status", verifyJWT, isAdmin, updateOrderStatusManually);

/**
 * Add tracking number (admin)
 * PATCH /api/v1/order/admin/:orderId/tracking
 */
router.patch("/admin/:orderId/tracking", verifyJWT, isAdmin, genericLimiter, addTrackingNumber);

/**
 * Add admin notes to order
 * PATCH /api/v1/order/admin/:orderId/notes
 */
router.patch("/admin/:orderId/notes", verifyJWT, isAdmin, genericLimiter, addAdminNotes);

/**
 * Cancel order (admin - can cancel any order)
 * POST /api/v1/order/admin/:orderId/cancel
 */
router.post("/admin/:orderId/cancel", verifyJWT, isAdmin, genericLimiter, cancelOrderByIdAdmin);

// =====================
// User Routes (authenticated)
// =====================
/**
 * Create new order
 * POST /api/v1/order
 */
router.post("/", verifyJWT, genericLimiter, createOrder);

/**
 * Get all orders for logged-in user
 * GET /api/v1/order
 */
router.get("/", verifyJWT, genericLimiter, getOrdersByUserId);

/**
 * Get specific order by ID (user's own order)
 * GET /api/v1/order/:orderId
 */
router.get("/:orderId", verifyJWT, genericLimiter, getOrderById);

/**
 * Cancel order (user can cancel their own unpaid orders)
 * POST /api/v1/order/:orderId/cancel
 */
router.post("/:orderId/cancel", verifyJWT, genericLimiter, cancelOrderById);

module.exports = router;