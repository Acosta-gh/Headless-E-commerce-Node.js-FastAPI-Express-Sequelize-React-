
// routes/v1/mercadopago.routes.js
const express = require("express");
const router = express.Router();

const {
  createPreference,
} = require("@/controllers/mercadopago.controller");


// ======================================================================
//                      💳 MercadoPago Routes
// ======================================================================
// Create MercadoPago preference


// router.post("/preference", createPreference);

module.exports = router;
