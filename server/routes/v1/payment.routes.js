const express = require("express");
const router = express.Router();
const { getAvailablePaymentMethods, createPaymentMethod } = require("@/controllers/payment.controller");

// ======================================================================
//               🔐 Authentication & Authorization Middlewares
// ======================================================================
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");


// ======================================================================
//                      Payment Routes
// ======================================================================
// GET /api/v1/payment - Obtener métodos de pago disponibles
router.get("/", getAvailablePaymentMethods);

router.post("/", verifyJWT, isAdmin, createPaymentMethod);

module.exports = router;