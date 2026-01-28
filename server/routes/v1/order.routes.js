const express = require("express");
const router = express.Router();

const { genericLimiter } = require("@/middlewares/rateLimit.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyWebhookSecret } = require("@/middlewares/verifyWebhookSecret.middleware");

const {
  createOrder,
  getOrdersByUserId,
  updatePaymentFromWebhook,
  updatePaymentManually,
  updateOrderStatusManually
} = require("@/controllers/order.controller");

router.post("/", verifyJWT, genericLimiter, createOrder);
router.get("/", verifyJWT, genericLimiter, getOrdersByUserId);

// Debug middleware para webhook
router.patch(
  "/:orderId/payment/webhook",
  verifyWebhookSecret,
  updatePaymentFromWebhook
);

router.patch("/:orderId/payment", verifyJWT, isAdmin, updatePaymentManually);
router.patch("/:orderId/status", verifyJWT, isAdmin, updateOrderStatusManually);

module.exports = router;