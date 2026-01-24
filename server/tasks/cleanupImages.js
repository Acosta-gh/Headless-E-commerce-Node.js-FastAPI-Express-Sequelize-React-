/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const cron = require("node-cron");
const { Op } = require("sequelize");
const { Image } = require("@/models/index");
const { deleteImageById } = require("@/services/image.service");

// Schedule a task to run monthly to clean up orphaned images
// Runs at 3:00 AM on the 1st of every month
cron.schedule("0 3 1 * *", async () => {
//cron.schedule('* * * * *', async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    //const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

    const imagesToDelete = await Image.findAll({
      where: {
        articleId: null,
        createdAt: {
          [Op.lt]: twentyFourHoursAgo,
          //[Op.lt]: tenSecondsAgo,
        },
      },
    });

    if (imagesToDelete.length > 0) {
      console.log(`Deleting ${imagesToDelete.length} orphaned images...`);
      for (const img of imagesToDelete) {
        try {
          await deleteImageById(img.id);
          console.log(`Image ${img.id} deleted successfully.`);
        } catch (err) {
          console.error(`Error deleting image ${img.id}:`, err);
        }
      }
    } else {
      console.log("No orphaned images to delete.");
    }
  } catch (error) {
    console.error("Error cleaning up orphaned images:", error);
  }
});
