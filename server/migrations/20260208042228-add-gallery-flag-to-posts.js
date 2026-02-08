"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Images", "type", {
      type: Sequelize.ENUM("markdown", "gallery"),
      allowNull: false,
      defaultValue: "markdown",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Images", "type");

    // IMPORTANTE PARA POSTGRES
    // El ENUM queda “colgado” si no se borra a mano
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Images_type";'
    );
  },
};
