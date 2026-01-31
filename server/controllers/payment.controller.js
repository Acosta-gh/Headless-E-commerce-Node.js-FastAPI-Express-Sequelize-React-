const paymentService = require("@/services/payment.service");

/**
 * GET /api/v1/payment
 * Public — returns only enabled methods
 */
async function getAvailablePaymentMethods(req, res) {
  try {
    const result = await paymentService.getAvailablePaymentMethods();
    return res.status(200).json({ success: true, methods: result, count: result.length });
  } catch (error) {
    console.error("Error getting available payment methods:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/v1/payment/admin/all
 * Admin — returns all methods (enabled + disabled)
 */
async function getAllPaymentMethodsAdmin(req, res) {
  try {
    const result = await paymentService.getAllPaymentMethods();
    return res.status(200).json({ success: true, methods: result, count: result.length });
  } catch (error) {
    console.error("Error getting all payment methods:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/v1/payment/admin/:id
 * Admin — single method by ID
 */
async function getPaymentMethodById(req, res) {
  try {
    const method = await paymentService.getPaymentMethodById(parseInt(req.params.id));

    if (!method) {
      return res.status(404).json({ success: false, error: "Payment method not found" });
    }

    return res.status(200).json({ success: true, method });
  } catch (error) {
    console.error("Error getting payment method:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/payment/admin
 * Admin — create new payment method
 */
async function createPaymentMethod(req, res) {
  try {
    const result = await paymentService.createPaymentMethod(req.body);
    return res.status(201).json({ success: true, method: result });
  } catch (error) {
    console.error("Error creating payment method:", error);

    if (error.message.includes("already exists")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/v1/payment/admin/:id
 * Admin — update payment method
 */
async function updatePaymentMethod(req, res) {
  try {
    const method = await paymentService.updatePaymentMethod(parseInt(req.params.id), req.body);
    return res.status(200).json({ success: true, method });
  } catch (error) {
    console.error("Error updating payment method:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/v1/payment/admin/:id/toggle
 * Admin — toggle enabled status
 */
async function togglePaymentMethodStatus(req, res) {
  try {
    const method = await paymentService.togglePaymentMethodStatus(parseInt(req.params.id));
    return res.status(200).json({
      success: true,
      message: `Payment method ${method.enabled ? "enabled" : "disabled"}`,
      method,
    });
  } catch (error) {
    console.error("Error toggling payment method:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/v1/payment/admin/:id
 * Admin — soft delete (disables the method)
 */
async function deletePaymentMethod(req, res) {
  try {
    const method = await paymentService.deletePaymentMethod(parseInt(req.params.id));
    return res.status(200).json({ success: true, message: "Payment method disabled", method });
  } catch (error) {
    console.error("Error deleting payment method:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message.includes("Cannot delete")) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAvailablePaymentMethods,
  getAllPaymentMethodsAdmin,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
};

