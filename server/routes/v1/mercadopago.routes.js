const express = require("express");
const router = express.Router();
const axios = require("axios");

const PY_MP_URL = process.env.PY_MP_URL || "http://localhost:8000";

/**
 * Proxy para crear preference en Python
 */
router.post("/preference", async (req, res) => {
  try {
    const response = await axios.post(`${PY_MP_URL}/mp/preference`, {
      items: req.body.items,
      external_reference: req.body.external_reference,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("MP proxy error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Error creando preference en Python",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;