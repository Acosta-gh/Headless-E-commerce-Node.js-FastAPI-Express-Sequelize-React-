const imageService = require("@/services/image.service");

async function getAllImages(req, res) {
  try {
    const images = await imageService.getAllImages();
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function createImage(req, res) {
  try {
    console.log("Creating image with req.file:", req.file);
    console.log("Creating image with req.body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    let { tempId, articleId } = req.body;

    // If we are creating a new image, either tempId or articleId must be provided
    if (!tempId && !articleId) {
      return res.status(400).json({ error: "Missing tempId and articleId" });
    }

    // If articleId is provided, we don't need tempId
    if (articleId) {
      tempId = null;
    }

    const fileName = req.file.filename || req.file.path.split("/").pop();
    const imageUrl = `/uploads/${fileName}`;

    // Create the image record
    const image = await imageService.createImage({
      tempId,
      articleId,
      url: imageUrl,
    });

    return res.status(201).json(image);
  } catch (error) {
    console.error("Error while creating image:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function destroyImage(req, res) {
  try {
    await deleteImageById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createImage,
  getAllImages,
  destroyImage,
};
