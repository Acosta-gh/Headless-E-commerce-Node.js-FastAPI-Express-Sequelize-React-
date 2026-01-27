/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const { Preference } = require('mercadopago');
const client = require("@/config/mercadopago");

const createPreference = async ({ items, external_reference }) => {
  if (!external_reference) {
    throw new Error("external_reference is required");
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("items are required");
  }

  try {
    const preference = new Preference(client);
    
    const body = {
      items: items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'ARS'
      })),
      external_reference,
      notification_url: process.env.MP_WEBHOOK_URL,
      back_urls: {
        success: process.env.MP_SUCCESS_URL || `${process.env.FRONTEND_URL}/payment/success`,
        failure: process.env.MP_FAILURE_URL || `${process.env.FRONTEND_URL}/payment/failure`,
        pending: process.env.MP_PENDING_URL || `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      statement_descriptor: 'TU_TIENDA'
    };

    const response = await preference.create({ body });
    
    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    };
  } catch (error) {
    console.error('Mercado Pago API Error:', error);
    throw new Error(`Mercado Pago error: ${error.message}`);
  }
};

module.exports = {
  createPreference,
};