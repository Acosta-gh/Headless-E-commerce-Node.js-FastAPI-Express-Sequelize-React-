const { Image } = require("@/models/index");
const fs = require("fs");
const path = require("path");

const createImage = async (data) => {
  console.log("Creating image with data:", data);
  try {
    const image = await Image.create(data);
    return image;
  } catch (error) {
    throw new Error("Error creating image: " + error.message);
  }
};

const getAllImages = async () => {
  try {
    const images = await Image.findAll();
    return images;
  } catch (error) {
    throw new Error("Error fetching images: " + error.message);
  }
};

async function deleteImageById(imageId) {
  const image = await Image.findByPk(imageId);
  if (!image) throw new Error("Image not found");

  try {
    await fs.promises.unlink(
      path.join(__dirname, "../uploads", path.basename(image.url))
    );
  } catch (err) {
    console.error("Error deleting image file:", err);
  }

  await image.destroy();
  return true;
}

module.exports = {
  createImage,
  getAllImages,
  deleteImageById,
};
