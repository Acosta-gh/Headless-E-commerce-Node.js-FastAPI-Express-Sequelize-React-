'use strict';

const shippingMethods = [
  {
    code: 'standard',
    name: 'Envío Estándar',
    enabled: true,
    baseCost: 5.99,
    freeShippingThreshold: 50.00,
    estimatedDaysMin: 3,
    estimatedDaysMax: 5,
    regionalPricing: null,
    postalCodeRules: null,
    useWeightPricing: false,
    weightPricingRules: null,
    availableCountries: ['AR', 'CL', 'UY'],
    unavailablePostalCodes: null,
    description: 'Envío estándar a todo el país',
    icon: 'truck',
    displayOrder: 1,
    carrierName: 'Correo Argentino',
    trackingUrlTemplate: 'https://www.correoargentino.com.ar/seguimiento?codigo={trackingNumber}',
    requiresAddress: true,
    allowCashOnDelivery: true,
    maxOrderValue: null,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚚 Seeding shipping methods...');
    
    const timestamp = new Date();
    const codes = shippingMethods.map(m => m.code);

    await queryInterface.bulkDelete('shipping_methods', {
      code: codes
    });
    console.log('🗑️  Registros anteriores eliminados');

    for (const method of shippingMethods) {
      await queryInterface.bulkInsert('shipping_methods', [
        {
          code: method.code,
          name: method.name,
          enabled: method.enabled,
          baseCost: method.baseCost,
          freeShippingThreshold: method.freeShippingThreshold,
          estimatedDaysMin: method.estimatedDaysMin,
          estimatedDaysMax: method.estimatedDaysMax,
          regionalPricing: method.regionalPricing ? JSON.stringify(method.regionalPricing) : null,
          postalCodeRules: method.postalCodeRules ? JSON.stringify(method.postalCodeRules) : null,
          useWeightPricing: method.useWeightPricing,
          weightPricingRules: method.weightPricingRules ? JSON.stringify(method.weightPricingRules) : null,
          availableCountries: JSON.stringify(method.availableCountries),
          unavailablePostalCodes: method.unavailablePostalCodes ? JSON.stringify(method.unavailablePostalCodes) : null,
          description: method.description,
          icon: method.icon,
          displayOrder: method.displayOrder,
          carrierName: method.carrierName,
          trackingUrlTemplate: method.trackingUrlTemplate,
          requiresAddress: method.requiresAddress,
          allowCashOnDelivery: method.allowCashOnDelivery,
          maxOrderValue: method.maxOrderValue,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      ]);
    }

    console.log('🎉 Shipping methods seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Rolling back shipping methods seed...');
    
    await queryInterface.bulkDelete('shipping_methods', {
      code: shippingMethods.map(m => m.code),
    });
    
    console.log('✅ Rollback completed');
  }
};