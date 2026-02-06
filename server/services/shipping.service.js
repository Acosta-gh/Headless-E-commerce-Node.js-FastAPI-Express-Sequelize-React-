const { ShippingMethod } = require('@/models/shippingMethod.model');

const ARGENTINA_PROVINCES = [
  "Buenos Aires", "Capital Federal", "Catamarca", "Chaco", "Chubut",
  "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
  "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén",
  "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

/**
 * 🛡️ Asegura que solo existan las provincias de la lista oficial
 * 
 * IMPORTANTE: Solo incluimos provincias que el admin configuró explícitamente.
 * Las provincias NO configuradas permitirán que la cascada llegue al baseCost (precio nacional).
 */
const applyStrictProvinceRules = (inputRules = {}) => {
  const cleanRules = { ...inputRules };
  const sanitizedProvinces = {};
  const inputProvinces = cleanRules.provinces || {};

  // Solo procesamos provincias que están en la lista oficial Y fueron configuradas por el admin
  ARGENTINA_PROVINCES.forEach(province => {
    if (inputProvinces[province]) {
      sanitizedProvinces[province] = {
        cost: parseFloat(inputProvinces[province].cost || 0),
        available: inputProvinces[province].available !== false
      };
    }
    // NO creamos entry para provincias no configuradas
    // Esto permite que la cascada llegue al baseCost (nacional)
  });

  cleanRules.provinces = sanitizedProvinces;
  return cleanRules;
};

/**
 * Normalize address to internal format
 */
const normalizeAddress = (address) => {
  // Si ya tiene el formato interno completo, retornar tal cual
  if (address.shippingState && address.shippingPostalCode && address.shippingCountry) {
    return address;
  }

  // Si tiene el formato externo, convertir
  if (address.state || address.province || address.city || address.postalCode) {
    return {
      shippingCity: address.city,
      shippingState: address.state || address.province,
      shippingPostalCode: address.postalCode,
      shippingCountry: address.country,
    };
  }


  return address;
};

/**
 * 💰 SISTEMA DE CASCADA DE PRECIOS
 * 
 * Orden de prioridad:
 * 1. Código Postal (más específico)
 * 2. Provincia (intermedio)
 * 3. Base Cost = Precio Nacional (más general)
 */
const calculateShippingCost = async (
  shippingMethodId,
  shippingAddress,
  orderSubtotal,
  isBulky = false
) => {
  try {
    const address = normalizeAddress(shippingAddress);
    
    console.log('🔍 === SHIPPING COST CALCULATION DEBUG ===');
    console.log('📍 Original address:', shippingAddress);
    console.log('📍 Normalized address:', address);

    const shippingMethod = await ShippingMethod.findByPk(shippingMethodId);

    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }

    if (!shippingMethod.enabled) {
      throw new Error('Shipping method is not available');
    }

    const rules = shippingMethod.rules || {};
    
    console.log('📋 Rules:', JSON.stringify(rules, null, 2));
    
    // =====================================================
    // PASO 0: Verificar envío gratis por monto
    // =====================================================
    if (rules.freeShippingThreshold && orderSubtotal >= rules.freeShippingThreshold) {
      console.log('✅ Free shipping applied (threshold met)');
      return {
        cost: 0,
        originalCost: parseFloat(shippingMethod.baseCost),
        freeShipping: true,
        appliedRule: 'freeShippingThreshold',
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
    }

    // =====================================================
    // SISTEMA DE CASCADA - BÚSQUEDA POR PRIORIDAD
    // =====================================================
    
    let finalCost = null;
    let appliedRule = null;
    let ruleDetails = {};

    // -------------------------------------------------------
    // NIVEL 1: Buscar por CÓDIGO POSTAL (más específico)
    // -------------------------------------------------------
    console.log('🔍 NIVEL 1: Checking postal code...');
    console.log('   Has postalCodes rules?', !!rules.postalCodes);
    console.log('   Address postal code:', address.shippingPostalCode);
    console.log('   Type:', typeof address.shippingPostalCode);
    
    if (rules.postalCodes && address.shippingPostalCode) {
      console.log('   Available postal codes:', Object.keys(rules.postalCodes));
      const postalCode = String(address.shippingPostalCode);
      const postalCodeRule = rules.postalCodes[postalCode];
      
      console.log('   Looking for:', postalCode);
      console.log('   Found rule:', postalCodeRule);

      if (postalCodeRule) {
        if (postalCodeRule.available === false) {
          throw new Error(`Shipping not available for postal code ${postalCode}`);
        }

        finalCost = parseFloat(postalCodeRule.cost || 0);
        appliedRule = 'postalCode';
        ruleDetails = {
          postalCode: postalCode,
          cost: finalCost
        };
        console.log('   ✅ POSTAL CODE MATCH! Cost:', finalCost);
      } else {
        console.log('   ❌ No postal code match');
      }
    }

    // -------------------------------------------------------
    // NIVEL 2: Buscar por PROVINCIA (si no hubo match en CP)
    // -------------------------------------------------------
    console.log('🔍 NIVEL 2: Checking province...');
    console.log('   finalCost is null?', finalCost === null);
    console.log('   Has provinces rules?', !!rules.provinces);
    console.log('   Address state:', address.shippingState);
    
    if (finalCost === null && rules.provinces && address.shippingState) {
      console.log('   Available provinces:', Object.keys(rules.provinces));
      const provinceRule = rules.provinces[address.shippingState];
      console.log('   Found rule:', provinceRule);

      if (provinceRule !== undefined) {
        if (provinceRule.available === false) {
          throw new Error(`Shipping not available for province ${address.shippingState}`);
        }

        finalCost = parseFloat(provinceRule.cost || 0);
        appliedRule = 'province';
        ruleDetails = {
          province: address.shippingState,
          cost: finalCost
        };
        console.log('   ✅ PROVINCE MATCH! Cost:', finalCost);
      } else {
        console.log('   ❌ No province match');
      }
    }

    // -------------------------------------------------------
    // NIVEL 3: PRECIO NACIONAL (baseCost) - por defecto
    // -------------------------------------------------------
    if (finalCost === null) {
      console.log('🔍 NIVEL 3: Using national base cost');
      finalCost = parseFloat(shippingMethod.baseCost);
      appliedRule = 'national';
      ruleDetails = {
        reason: 'No specific postal code or province rule found',
        baseCost: finalCost
      };
      console.log('   ✅ NATIONAL COST:', finalCost);
    }

    // =====================================================
    // PASO FINAL: Aplicar cargo por bulto si corresponde
    // =====================================================
    const bulkyExtra = (isBulky && rules.bulkyExtra) ? parseFloat(rules.bulkyExtra) : 0;
    const totalCost = finalCost + bulkyExtra;

    console.log('💰 FINAL CALCULATION:');
    console.log('   Shipping cost:', finalCost);
    console.log('   Bulky extra:', bulkyExtra);
    console.log('   TOTAL:', totalCost);
    console.log('   Applied rule:', appliedRule);
    console.log('🔍 === END DEBUG ===\n');

    return {
      cost: parseFloat(totalCost.toFixed(2)),
      breakdown: {
        shippingCost: parseFloat(finalCost.toFixed(2)),
        bulkyExtra: parseFloat(bulkyExtra.toFixed(2))
      },
      appliedRule,
      ruleDetails,
      freeShipping: false,
      estimatedDays: {
        min: shippingMethod.estimatedDaysMin,
        max: shippingMethod.estimatedDaysMax
      },
      method: {
        id: shippingMethod.id,
        code: shippingMethod.code,
        name: shippingMethod.name,
        carrierName: shippingMethod.carrierName,
        description: shippingMethod.description,
        icon: shippingMethod.icon
      }
    };

  } catch (error) {
    console.error('❌ Error in calculateShippingCost:', error);
    throw new Error(`Error calculating shipping cost: ${error.message}`);
  }
};

/**
 * Get all available shipping methods for a given location and order
 */
const getAvailableShippingMethods = async (
  shippingAddress,
  orderSubtotal,
  isBulky = false
) => {
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
          isBulky
        );

        availableMethods.push(costData);
      } catch (error) {
        // Método no disponible para esta ubicación/orden
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
const validateShippingMethod = async (
  shippingMethodId,
  shippingAddress,
  orderSubtotal,
  isBulky = false
) => {
  try {
    const costData = await calculateShippingCost(
      shippingMethodId,
      shippingAddress,
      orderSubtotal,
      isBulky
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

// =====================
// Admin Methods
// =====================

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
    const method = await ShippingMethod.findByPk(id);

    if (!method) {
      throw new Error('Shipping method not found');
    }

    return method;
  } catch (error) {
    throw new Error(`Error getting shipping method: ${error.message}`);
  }
};

/**
 * Create shipping method with auto-populated provinces
 */
const createShippingMethod = async (data) => {
  try {
    // Aplicamos el filtro estricto antes de crear
    data.rules = applyStrictProvinceRules(data.rules || {});

    validateRulesStructure(data.rules);

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
    if (!shippingMethod) throw new Error('Shipping method not found');

    // Si el update incluye 'rules', aplicamos la limpieza estricta
    if (data.rules) {
      data.rules = applyStrictProvinceRules(data.rules);
      validateRulesStructure(data.rules);
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
 * Delete shipping method
 */
const deleteShippingMethodById = async (id) => {
  try {
    const shippingMethod = await ShippingMethod.findByPk(id);

    if (!shippingMethod) {
      throw new Error('Shipping method not found');
    }

    await shippingMethod.destroy();
    return shippingMethod;
  } catch (error) {
    throw new Error(`Error deleting shipping method: ${error.message}`);
  }
};

/**
 * Validate rules structure
 */
const validateRulesStructure = (rules) => {
  if (typeof rules !== 'object') {
    throw new Error('Rules must be an object');
  }

  if (rules.postalCodes && typeof rules.postalCodes !== 'object') {
    throw new Error('postalCodes must be an object');
  }

  if (rules.provinces && typeof rules.provinces !== 'object') {
    throw new Error('provinces must be an object');
  }

  if (rules.bulkyExtra && isNaN(parseFloat(rules.bulkyExtra))) {
    throw new Error('bulkyExtra must be a number');
  }

  if (rules.freeShippingThreshold && isNaN(parseFloat(rules.freeShippingThreshold))) {
    throw new Error('freeShippingThreshold must be a number');
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