const { Preference, Payment } = require("mercadopago");
const mpClient = require("../config/mercadopago");

const preference = new Preference(mpClient);
const paymentClient = new Payment(mpClient);

const getPaymentById = async (paymentId) => {
  const response = await paymentClient.get({ id: paymentId });
  return response;
};

const createPreference = async (items, orderId = null) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Items must be a non-empty array");
  }

  items.forEach((item, index) => {
    if (!item.title || !item.quantity || !item.unit_price) {
      throw new Error(
        `Item at index ${index} is missing required fields (title, quantity, unit_price)`
      );
    }
  });

  const preferenceData = {
    items: items,
    notification_url: process.env.MP_WEBHOOK_URL,
    back_urls: {
      success: process.env.MP_BACK_URL_SUCCESS,
      failure: process.env.MP_BACK_URL_FAILURE,
      pending: process.env.MP_BACK_URL_PENDING,
    },
    auto_return: "approved",
  };

  // Si se proporciona orderId, agregarlo como referencia externa
  if (orderId) {
    preferenceData.external_reference = String(orderId);
    preferenceData.metadata = {
      order_id: orderId,
    };
  }

  const response = await preference.create({
    body: preferenceData,
  });

  if (!response || !response.id) {
    throw new Error("MercadoPago did not return preference");
  }

  return response;
};

module.exports = {
  getPaymentById,
  createPreference,
};