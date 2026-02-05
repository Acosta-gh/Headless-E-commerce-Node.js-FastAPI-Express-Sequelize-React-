'use strict';

const ARGENTINA_PROVINCES = [
  "Buenos Aires", "Capital Federal", "Catamarca", "Chaco", "Chubut",
  "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
  "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén",
  "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
  "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

const applyStrictProvinceRules = (inputRules = {}) => {
  const cleanRules = { ...inputRules };
  const sanitizedProvinces = {};
  const inputProvinces = cleanRules.provinces || {};

  ARGENTINA_PROVINCES.forEach(province => {
    if (inputProvinces[province]) {
      sanitizedProvinces[province] = {
        cost: parseFloat(inputProvinces[province].cost || 0),
        available: inputProvinces[province].available !== false
      };
    }
  });

  cleanRules.provinces = sanitizedProvinces;
  return cleanRules;
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const shippingMethods = [
      {
        code: "correo_standard",
        name: "Correo Argentino Estándar",
        carrierName: "Correo Argentino",
        description: "Entrega a domicilio en todo el país",
        baseCost: 1500,
        rules: JSON.stringify(applyStrictProvinceRules({
          provinces: {
            "Buenos Aires": { cost: 1200 },
            "Capital Federal": { cost: 1000 },
          },
          bulkyExtra: 500,
          freeShippingThreshold: 20000
        })),
        enabled: true,
        displayOrder: 1,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        icon: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: "oca_express",
        name: "OCA Express",
        carrierName: "OCA",
        description: "Entrega rápida en todo el país",
        baseCost: 2500,
        rules: JSON.stringify(applyStrictProvinceRules({
          provinces: {
            "Buenos Aires": { cost: 2000 },
            "Capital Federal": { cost: 1800 },
          },
          bulkyExtra: 800,
          freeShippingThreshold: 30000
        })),
        enabled: true,
        displayOrder: 2,
        estimatedDaysMin: 1,
        estimatedDaysMax: 4,
        icon: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const method of shippingMethods) {
      try {
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM shipping_methods WHERE code = :code LIMIT 1`,
          {
            replacements: { code: method.code },
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (!existing) {
          await queryInterface.bulkInsert("shipping_methods", [method]);
          console.log(`✅ Inserted shipping method: ${method.code}`);
        } else {
          console.log(`⚠️  Shipping method already exists: ${method.code}`);
        }
      } catch (error) {
        console.log(`❌ Error inserting shipping method ${method.code}:`, error.message);
        console.log(`⏭️  Continuing with next method...`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete("shipping_methods", {
        code: ["correo_standard", "oca_express"],
      });
      console.log("🗑️  Shipping methods removed");
    } catch (error) {
      console.log("⚠️  Error removing shipping methods:", error.message);
    }
  }
};
