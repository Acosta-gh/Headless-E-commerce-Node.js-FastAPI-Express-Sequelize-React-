const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const ShippingMethod = sequelize.define(
  "ShippingMethod",
  {
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Unique code: "standard", "express", "pickup"',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Display name (e.g., "Standard Shipping", "Express Delivery", "Store Pickup")',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    
    // =====================
    // Base Pricing
    // =====================
    baseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Base shipping cost',
    },
    
    // =====================
    // Free Shipping Threshold
    // =====================
    freeShippingThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Minimum order amount for free shipping (null = no free shipping)',
    },
    
    // =====================
    // Estimated Delivery Time
    // =====================
    estimatedDaysMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Minimum estimated delivery days',
    },
    estimatedDaysMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Maximum estimated delivery days',
    },
    
    // =====================
    // Regional Pricing
    // =====================
    regionalPricing: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional cost by region/province. Format: { "Buenos Aires": 0, "Cordoba": 300, "Patagonia": 800 }',
    },
    
    // =====================
    // Postal Code Pricing Rules
    // =====================
    postalCodeRules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Specific pricing or availability by postal code range. Format: [{ rangeStart: "1000", rangeEnd: "1999", additionalCost: 0, available: true }]',
    },
    
    // =====================
    // Weight-Based Pricing
    // =====================
    useWeightPricing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Enable weight-based pricing',
    },
    weightPricingRules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Weight brackets with costs. Format: [{ maxWeight: 5, cost: 500 }, { maxWeight: 10, cost: 800 }]',
    },
    
    // =====================
    // Availability
    // =====================
    availableCountries: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'List of country codes where this method is available (null = all countries)',
    },
    unavailablePostalCodes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'List of postal codes or ranges where shipping is not available',
    },
    
    // =====================
    // Additional Information
    // =====================
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description shown to customers',
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Icon URL or identifier',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Display order in checkout',
    },
    
    // =====================
    // Carrier Information
    // =====================
    carrierName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Shipping carrier name (e.g., "Correo Argentino", "OCA", "Andreani")',
    },
    trackingUrlTemplate: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL template for tracking. Use {trackingNumber} as placeholder',
    },
    
    // =====================
    // Business Rules
    // =====================
    requiresAddress: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this method requires a shipping address (false for pickup)',
    },
    allowCashOnDelivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Allow cash payment on delivery',
    },
    maxOrderValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Maximum order value for this shipping method (security limit)',
    },
  },
  {
    timestamps: true,
    tableName: "shipping_methods",
  }
);

module.exports = { ShippingMethod };