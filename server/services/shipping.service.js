const { ShippingMethod } = require('@/models/shippingMethod.model');

/**
 * Normalize address to internal format
 * Accepts both API format (city, state) and internal format (shippingCity, shippingState)
 * @private
 */
const normalizeAddress = (address) => {
  // If already in internal format, return as-is
  if (address.shippingCity !== undefined) {
    return address;
  }

  // Transform API format to internal format
  return {
    shippingCity: address.city,
    shippingState: address.state,
    shippingPostalCode: address.postalCode,
    shippingCountry: address.country,
  };
};

/**
 * Calculate shipping cost based on method, location, and order details
 * @param {number} shippingMethodId - ID of the shipping method
 * @param {Object} shippingAddress - Shipping address (accepts both API and internal format)
 * @param {number} orderSubtotal - Order subtotal amount
 * @param {number} orderWeight - Total order weight (optional)
 * @returns {Promise<Object>} Calculated shipping cost and details
 */
const calculateShippingCost = async (
  shippingMethodId,
  shippingAddress,
  orderSubtotal,
  orderWeight = 0
) => {
  try {
    // Normalize address format
    const address = normalizeAddress(shippingAddress);

    const shippingMethod = await ShippingMethod.findByPk(shippingMethodId);

    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }

    if (!shippingMethod.enabled) {
      throw new Error('Shipping method is not available');
    }

    // Check if method is available for this country
    if (shippingMethod.availableCountries &&
      !shippingMethod.availableCountries.includes(address.shippingCountry)) {
      throw new Error(`Shipping method not available for ${address.shippingCountry}`);
    }

    // Check if postal code is unavailable
    if (shippingMethod.unavailablePostalCodes &&
      isPostalCodeUnavailable(address.shippingPostalCode, shippingMethod.unavailablePostalCodes)) {
      throw new Error('Shipping not available for this postal code');
    }

    let shippingCost = parseFloat(shippingMethod.baseCost);

    // Apply free shipping threshold
    if (shippingMethod.freeShippingThreshold &&
      orderSubtotal >= parseFloat(shippingMethod.freeShippingThreshold)) {
      return {
        cost: 0,
        originalCost: shippingCost,
        freeShipping: true,
        estimatedDays: {
          min: shippingMethod.estimatedDaysMin,
          max: shippingMethod.estimatedDaysMax
        },
        method: {
          id: shippingMethod.id,
          code: shippingMethod.code,
          name: shippingMethod.name
        }
      };
    }

    // Apply regional pricing
    if (shippingMethod.regionalPricing && address.shippingState) {
      const regionalCost = shippingMethod.regionalPricing[address.shippingState];
      if (regionalCost !== undefined) {
        shippingCost += parseFloat(regionalCost);
      }
    }

    // Apply postal code specific rules
    if (shippingMethod.postalCodeRules) {
      const postalCodeCost = getPostalCodeCost(
        address.shippingPostalCode,
        shippingMethod.postalCodeRules
      );
      if (postalCodeCost !== null) {
        shippingCost += postalCodeCost;
      }
    }

    // Apply weight-based pricing
    if (shippingMethod.useWeightPricing &&
      shippingMethod.weightPricingRules &&
      orderWeight > 0) {
      const weightCost = getWeightBasedCost(orderWeight, shippingMethod.weightPricingRules);
      if (weightCost !== null) {
        shippingCost = weightCost; // Replace base cost with weight-based cost
      }
    }

    // Check max order value restriction
    if (shippingMethod.maxOrderValue &&
      orderSubtotal > parseFloat(shippingMethod.maxOrderValue)) {
      throw new Error(`Order value exceeds maximum allowed for this shipping method`);
    }

    return {
      cost: parseFloat(shippingCost.toFixed(2)),
      originalCost: parseFloat(shippingMethod.baseCost),
      freeShipping: false,
      estimatedDays: {
        min: shippingMethod.estimatedDaysMin,
        max: shippingMethod.estimatedDaysMax
      },
      method: {
        id: shippingMethod.id,
        code: shippingMethod.code,
        name: shippingMethod.name,
        carrierName: shippingMethod.carrierName
      }
    };

  } catch (error) {
    throw new Error(`Error calculating shipping cost: ${error.message}`);
  }
};

/**
 * Check if postal code is in unavailable list
 */
const isPostalCodeUnavailable = (postalCode, unavailableList) => {
  for (const item of unavailableList) {
    if (typeof item === 'string') {
      if (item === postalCode) return true;
    } else if (item.rangeStart && item.rangeEnd) {
      if (postalCode >= item.rangeStart && postalCode <= item.rangeEnd) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Get additional cost for postal code from rules
 */
const getPostalCodeCost = (postalCode, rules) => {
  for (const rule of rules) {
    if (rule.rangeStart && rule.rangeEnd) {
      if (postalCode >= rule.rangeStart && postalCode <= rule.rangeEnd) {
        if (rule.available === false) {
          throw new Error('Shipping not available for this postal code');
        }
        return rule.additionalCost || 0;
      }
    }
  }
  return null;
};

/**
 * Get weight-based cost from rules
 */
const getWeightBasedCost = (weight, rules) => {
  // Sort rules by maxWeight
  const sortedRules = [...rules].sort((a, b) => a.maxWeight - b.maxWeight);

  for (const rule of sortedRules) {
    if (weight <= rule.maxWeight) {
      return rule.cost;
    }
  }

  // If weight exceeds all brackets, use the highest bracket
  return sortedRules[sortedRules.length - 1].cost;
};

/**
 * Get all available shipping methods for a given location and order
 */
const getAvailableShippingMethods = async (shippingAddress, orderSubtotal, orderWeight = 0) => {
  try {
    const methods = await ShippingMethod.findAll({
      where: { enabled: true },
      order: [['displayOrder', 'ASC']],
    });

    const availableMethods = [];

    for (const method of methods) {
      try {
        const costData = await calculateShippingCost(
          method.id,
          shippingAddress,
          orderSubtotal,
          orderWeight
        );

        availableMethods.push({
          id: method.id,
          code: method.code,
          name: method.name,
          description: method.description,
          icon: method.icon,
          ...costData,
          requiresAddress: method.requiresAddress,
          allowCashOnDelivery: method.allowCashOnDelivery,
        });
      } catch (error) {
        // Method not available for this location/order, skip it
        console.log(`Shipping method ${method.code} not available: ${error.message}`);
        continue;
      }
    }

    return availableMethods;
  } catch (error) {
    throw new Error(`Error getting available shipping methods: ${error.message}`);
  }
};

/**
 * Validate if a shipping method can be used for an order
 */
const validateShippingMethod = async (shippingMethodId, shippingAddress, orderSubtotal, orderWeight = 0) => {
  try {
    const costData = await calculateShippingCost(
      shippingMethodId,
      shippingAddress,
      orderSubtotal,
      orderWeight
    );

    return {
      valid: true,
      ...costData
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Create or update a shipping method
 */
const createShippingMethod = async (data) => {
  try {
    const shippingMethod = await ShippingMethod.create(data);
    return shippingMethod;
  } catch (error) {
    throw new Error(`Error creating shipping method: ${error.message}`);
  }
};

/**
 * Update shipping method
 */
const updateShippingMethod = async (id, data) => {
  try {
    const shippingMethod = await ShippingMethod.findByPk(id);
    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }
    await shippingMethod.update(data);
    return shippingMethod;
  } catch (error) {
    throw new Error(`Error updating shipping method: ${error.message}`);
  }
};

/**
 * Toggle shipping method enabled status
 */
const toggleShippingMethodStatus = async (id) => {
  try {
    const shippingMethod = await ShippingMethod.findByPk(id);
    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }
    await shippingMethod.update({ enabled: !shippingMethod.enabled });
    return shippingMethod;
  } catch (error) {
    throw new Error(`Error toggling shipping method status: ${error.message}`);
  }
};

/**
 * Get all shipping methods (admin)
 */
const getAllShippingMethods = async () => {
  try {
    return await ShippingMethod.findAll({
      order: [['displayOrder', 'ASC']],
    });
  } catch (error) {
    throw new Error(`Error getting shipping methods: ${error.message}`);
  }
};

/**
 * Get shipping method by ID
 */
const getShippingMethodById = async (id) => {
  try {
    return await ShippingMethod.findByPk(id);
  } catch (error) {
    throw new Error(`Error getting shipping method by id: ${error.message}`);
  }
};

const deleteShippingMethodById = async (id) => {
  try {
    await ShippingMethod.destroy({
      where: { id }
    });
  } catch (error) {
    throw new Error(`Error getting shipping method by id and deleting it: ${error.message}`);
  }
};

module.exports = {
  calculateShippingCost,
  getAvailableShippingMethods,
  validateShippingMethod,
  createShippingMethod,
  updateShippingMethod,
  toggleShippingMethodStatus,
  getAllShippingMethods,
  getShippingMethodById,
  deleteShippingMethodById
};