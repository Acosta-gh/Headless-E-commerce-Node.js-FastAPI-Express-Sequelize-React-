const { DataTypes } = require("sequelize");
const { sequelize } = require("@/database/sequelize");

const ShippingMethod = sequelize.define(
  "ShippingMethod",
  {
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "Unique identifier for the shipping method (e.g., 'standard', 'express')"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Display name for the shipping method"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Detailed description of the shipping method"
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Whether this shipping method is currently active"
    },
    
    // =====================
    // CASCADING PRICING SYSTEM
    // =====================
    
    /**
     * NIVEL 3 (Más general): Precio Nacional Base
     * Este es el precio que se aplica cuando NO hay match 
     * ni en código postal ni en provincia
     */
    baseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 15000, // Precio nacional por defecto
      comment: "Base national shipping cost (usado cuando no hay match en CP o provincia)"
    },
    
    // =====================
    // Cascading rules system
    // =====================
    rules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: `Sistema de cascada de precios (orden de prioridad):
      {
        // NIVEL 1 (Más específico): Códigos Postales
        "postalCodes": {
          "B8000": { "cost": 0 },      // Bahía Blanca - Gratis
          "B8001": { "cost": 0 },      // Bahía Blanca - Gratis
          "B8002": { "cost": 0 },      // Bahía Blanca - Gratis
          "B8003": { "cost": 0 },      // Bahía Blanca - Gratis
          "7500": { "cost": 5000 },    // Tres Arroyos - 5000
          "9400": { "available": false } // No disponible
        },
        
        // NIVEL 2 (Intermedio): Provincias
        "provinces": {
          "Buenos Aires": { "cost": 8000 },    // Provincia completa
          "Córdoba": { "cost": 10000 },
          "Tierra del Fuego": { "cost": 20000 },
          "Santa Fe": { "available": false }   // Provincia no disponible
        },
        
        // NIVEL 3: baseCost (15000) se usa automáticamente si no hay match
        
        // Extras opcionales
        "bulkyExtra": 800,              // Cargo por bulto
        "freeShippingThreshold": 50000  // Envío gratis si supera monto
      }
      
      CASCADA DE BÚSQUEDA:
      1. ¿Existe el código postal? → Usar ese precio
      2. ¿No existe CP pero existe provincia? → Usar precio provincial
      3. ¿No existe ni CP ni provincia? → Usar baseCost (precio nacional)
      `
    },
    
    // =====================
    // Display & metadata
    // =====================
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Order in which to display this method in the UI"
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Icon or image URL for the shipping method"
    },
    estimatedDaysMin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Minimum estimated delivery days"
    },
    estimatedDaysMax: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Maximum estimated delivery days"
    },
    carrierName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Name of the shipping carrier (e.g., 'Andreani', 'OCA')"
    }
  },
  {
    timestamps: true,
    tableName: "shipping_methods",
    indexes: [
      {
        fields: ['enabled']
      },
      {
        fields: ['displayOrder']
      }
    ]
  }
);

module.exports = { ShippingMethod };