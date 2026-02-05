'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const order = {
      orderNumber: `CASH-${Date.now()}`, // debe respetar mayúscula N
      userId: 1,
      customerName: "Cliente de prueba",
      customerEmail: "cliente@testing.com",
      customerPhone: "123456789",
      shippingAddress: "Calle Falsa 123",
      shippingAddressLine2: null,
      shippingCity: "Buenos Aires",
      shippingState: "Capital Federal",
      shippingPostalCode: "1000",
      shippingCountry: "AR",
      shippingMethodId: 1,
      shippingCost: 500.00,
      carrierName: "Correo Standard",
      subtotal: 1000.00,
      tax: 0,
      discountAmount: 0,
      surchargeAmount: 0,
      totalAmount: 1500.00,
      couponId: null,
      couponCode: null,
      couponDiscount: 0,
      paymentMethodId: 1,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      mercadopagoPreferenceId: null,
      mercadopagoPaymentId: null,
      mpMerchantOrderId: null,
      billingDocumentType: null,
      billingDocumentNumber: null,
      billingBusinessName: null,
      requiresInvoice: false,
      orderNotes: "Orden de prueba pagada en efectivo",
      adminNotes: null,
      paidAt: new Date(),
      confirmedAt: new Date(),
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      cancelReason: null,
      ipAddress: "127.0.0.1",
      userAgent: "Seeder Script",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Usar las comillas para respetar mayúsculas/minúsculas
      const existing = await queryInterface.sequelize.query(
        `SELECT id FROM "Orders" WHERE "orderNumber" = :orderNumber LIMIT 1`,
        { replacements: { orderNumber: order.orderNumber }, type: Sequelize.QueryTypes.SELECT }
      );

      if (!existing.length) {
        await queryInterface.bulkInsert('Orders', [order]);
        console.log(`✅ Order inserted: ${order.orderNumber}`);
      } else {
        console.log(`⚠️ Order already exists: ${order.orderNumber}`);
      }
    } catch (error) {
      console.log(`❌ Error inserting order: ${error.message}`);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Orders', { customerEmail: "cliente@testing.com" });
    console.log("🗑️ Test cash order removed");
  },
};
