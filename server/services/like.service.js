/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const { Like } = require("@/models/index");
const { transformLikes } = require("@/utils/dataTransformers");

const createLike = async (data, userId) => {
  if (!data || !userId) {
    throw new Error("Missing required fields: data and userId");
  }

  if (!data.articleId && !data.commentId) {
    throw new Error("Either articleId or commentId must be provided");
  }

  try {
    const existingLike = await Like.findOne({
      where: {
        articleId: data.articleId || null,
        commentId: data.commentId || null,
        userId,
      },
    });

    const whereClause = data.commentId
      ? { commentId: data.commentId }
      : { articleId: data.articleId };

    if (existingLike) {
      await existingLike.destroy();

      const remainingLikes = await Like.findAll({
        where: whereClause,
        attributes: ["userId"],
      });

      return {
        liked: false,
        message: "Like removed",
        ...transformLikes(remainingLikes),
      };
    } else {
      const like = await Like.create({
        articleId: data.articleId || null,
        commentId: data.commentId || null,
        userId,
      });

      const allLikes = await Like.findAll({
        where: whereClause,
        attributes: ["userId"],
      });

      return {
        liked: true,
        message: "Like added",
        id: like.id,
        ...transformLikes(allLikes),
      };
    }
  } catch (error) {
    throw new Error("Error creating/removing like: " + error.message);
  }
};

module.exports = {
  createLike,
};