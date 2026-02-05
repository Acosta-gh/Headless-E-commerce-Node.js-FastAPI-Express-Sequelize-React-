const ShippingService = require('@/services/shipping.service');

/**
 * 📦 Get available shipping methods for a given address and cart
 * POST /api/v1/shipping/calculate
 */
const getAvailableShippingMethods = async (req, res) => {
  try {
    const { shippingAddress, cartSubtotal, isBulky } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required (city, postalCode, country)'
      });
    }

    // Province/state is optional but recommended
    if (!shippingAddress.state && !shippingAddress.province) {
      console.warn('Province/state not provided in shipping address');
    }

    // Validate cart subtotal
    if (!cartSubtotal || cartSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid cart subtotal is required'
      });
    }

    const availableMethods = await ShippingService.getAvailableShippingMethods(
      shippingAddress,
      parseFloat(cartSubtotal),
      Boolean(isBulky)
    );

    res.status(200).json({
      success: true,
      methods: availableMethods,
      count: availableMethods.length
    });

  } catch (error) {
    console.error('Error getting available shipping methods:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 💰 Calculate shipping cost for a specific method
 * POST /api/v1/shipping/calculate/:methodId
 */
const calculateShippingCost = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { shippingAddress, orderSubtotal, isBulky } = req.body;

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: 'Shipping method ID is required'
      });
    }

    if (!shippingAddress || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    if (!orderSubtotal || orderSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order subtotal is required'
      });
    }

    const costData = await ShippingService.calculateShippingCost(
      parseInt(methodId),
      shippingAddress,
      parseFloat(orderSubtotal),
      Boolean(isBulky)
    );

    res.status(200).json({
      success: true,
      ...costData
    });

  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ✅ Validate shipping method for an order
 * POST /api/v1/shipping/validate/:methodId
 */
const validateShippingMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { shippingAddress, orderSubtotal, isBulky } = req.body;

    const validation = await ShippingService.validateShippingMethod(
      parseInt(methodId),
      shippingAddress,
      parseFloat(orderSubtotal),
      Boolean(isBulky)
    );

    res.status(200).json({
      success: validation.valid,
      ...validation
    });

  } catch (error) {
    console.error('Error validating shipping method:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// =====================
// Admin Controllers
// =====================

/**
 * 📋 Get all shipping methods (Admin)
 * GET /api/v1/shipping/admin/all
 */
const getAllShippingMethods = async (req, res) => {
  try {
    const methods = await ShippingService.getAllShippingMethods();

    res.status(200).json({
      success: true,
      methods,
      count: methods.length
    });

  } catch (error) {
    console.error('Error getting shipping methods:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 🔍 Get shipping method by ID (Admin)
 * GET /api/v1/shipping/admin/:id
 */
const getShippingMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await ShippingService.getShippingMethodById(parseInt(id));

    res.status(200).json({
      success: true,
      method
    });

  } catch (error) {
    console.error('Error getting shipping method:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ➕ Create shipping method (Admin)
 * POST /api/v1/shipping/admin
 */
const createShippingMethod = async (req, res) => {
  try {
    const method = await ShippingService.createShippingMethod(req.body);

    res.status(201).json({
      success: true,
      method,
      message: 'Shipping method created successfully'
    });

  } catch (error) {
    console.error('Error creating shipping method:', error);

    if (error.message.includes('already exists') || error.message.includes('Validation')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * ✏️ Update shipping method (Admin)
 * PATCH /api/v1/shipping/admin/:id
 */
const updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await ShippingService.updateShippingMethod(parseInt(id), req.body);

    res.status(200).json({
      success: true,
      method,
      message: 'Shipping method updated successfully'
    });

  } catch (error) {
    console.error('Error updating shipping method:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Validation')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 🔄 Toggle shipping method status (Admin)
 * PATCH /api/v1/shipping/admin/:id/toggle
 */
const toggleShippingMethodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await ShippingService.toggleShippingMethodStatus(parseInt(id));

    res.status(200).json({
      success: true,
      message: `Shipping method ${method.enabled ? 'enabled' : 'disabled'}`,
      method
    });

  } catch (error) {
    console.error('Error toggling shipping method status:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * 🗑️ Delete shipping method (Admin)
 * DELETE /api/v1/shipping/admin/:id
 */
const deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await ShippingService.deleteShippingMethodById(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Shipping method deleted successfully',
      method
    });

  } catch (error) {
    console.error('Error deleting shipping method:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  // Public endpoints
  getAvailableShippingMethods,
  calculateShippingCost,
  validateShippingMethod,

  // Admin endpoints
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  toggleShippingMethodStatus,
  deleteShippingMethod,
};