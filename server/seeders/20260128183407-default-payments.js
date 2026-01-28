"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "payment_methods",
      [
        {
          code: "cash",
          name: "Efectivo",
          enabled: true,
          discountPercentage: 10,
          surchargePercentage: 0,
          description: "Pagá en efectivo en el local",
          icon: "💵",
          displayOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "bank_transfer",
          name: "Transferencia bancaria",
          enabled: true,
          discountPercentage: 5,
          surchargePercentage: 0,
          description: "Pagá mediante transferencia bancaria",
          icon: "🏦",
          displayOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: "mercadopago",
          name: "MercadoPago",
          enabled: true,
          discountPercentage: 0,
          surchargePercentage: 0,
          description: "Pagá con MercadoPago (tarjeta, saldo o QR)",
          icon: "💳",
          displayOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {
        ignoreDuplicates: true, // 👈 CLAVE
      }
    );
  },

  async down() {
    // ❗ no se borran métodos de pago base
  },
};
