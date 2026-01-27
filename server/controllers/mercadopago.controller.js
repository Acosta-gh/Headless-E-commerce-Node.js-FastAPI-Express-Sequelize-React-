const mpService = require("@/services/mercadopago.service");


const createPreference = async (req, res) => {
  try {
    const data = await mpService.createPreference({
      items: req.body.items,
      external_reference: req.body.external_reference,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("MP controller error:", error.message);

    return res.status(500).json({
      error: "Error creando preference",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  createPreference,
};
