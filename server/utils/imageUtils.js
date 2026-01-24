const { Image } = require("@/models/index");

const adoptTempImages = async (tempId, articleId) => {
  if (!tempId) return;
  const images = await Image.findAll({ where: { tempId } });
  if (images.length === 0) return;

  await Promise.all(
    images.map((img) => img.update({ articleId, tempId: null }))
  );
};

module.exports = {
  adoptTempImages,
};
