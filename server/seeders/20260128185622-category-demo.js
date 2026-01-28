"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "categories",
      [
        {
          name: "Tecnología",
          description: "Gadgets, computación y accesorios",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "categories",
      { name: "Tecnología" },
      {}
    );
  },
};
