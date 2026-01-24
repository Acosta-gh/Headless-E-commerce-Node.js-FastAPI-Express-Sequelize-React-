/* 
const { createPreference } = require("../services/mercadopago.service");

const createPreferenceController = async (req, res) => {
  try {
    // Extraer items del body
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items are required and must be a non-empty array"
      });
    }
    
    // Crear preferencia con los items
    const preference = await createPreference(items);
    
    res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("MP controller error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createPreferenceController,
};
*/