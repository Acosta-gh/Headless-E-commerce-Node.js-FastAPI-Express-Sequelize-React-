"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "articles",
      [
        {
          authorId: 1,
          title: "Notebook Lenovo IdeaPad 0",
          slug: "notebook-lenovo-ideapad-0",
          content: "Notebook ideal para estudio y trabajo.",
          price: 9,
          stock: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "articles",
      { slug: "notebook-lenovo-ideapad-0" },
      {}
    );
  },
};
