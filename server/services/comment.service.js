/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

const { Comment, User, Like } = require("@/models/index");
const {
  transformComment,
  transformCommentsWithReplies,
  transformLikes,
} = require("@/utils/dataTransformers");

const createComment = async (data, userId) => {
  if (!data || !userId) {
    throw new Error("Missing required fields: data and userId");
  }

  try {
    const comment = await Comment.create({
      ...data,
      userId,
    });

    // This is to include user info in the returned comment right after creation
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
    });

    const commentData = commentWithUser.toJSON();
    return transformComment(commentData);
  } catch (error) {
    throw new Error("Error creating comment: " + error.message);
  }
};

const deleteComment = async (id) => {
  if (!id) {
    throw new Error("Comment ID is required");
  }

  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    await comment.destroy();
    return { success: true, message: "Comment deleted" };
  } catch (error) {
    throw new Error("Error deleting comment: " + error.message);
  }
};

const getCommentById = async (id) => {
  if (!id) {
    throw new Error("Comment ID is required");
  }

  try {
    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
        },
      ],
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    return transformComment(comment.toJSON());
  } catch (error) {
    throw new Error("Error fetching comment: " + error.message);
  }
};

const getAllCommentsByArticleId = async (articleId) => {
  if (!articleId) {
    throw new Error("Article ID is required");
  }

  try {
    const comments = await Comment.findAll({
      where: { articleId, commentId: null },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: Comment,
          as: "replies",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username", "email"],
            },
            {
              model: Like,
              as: "likes",
              attributes: ["userId"],
            },
          ],
        },
        {
          model: Like,
          as: "likes",
          attributes: ["userId"],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        [{ model: Comment, as: "replies" }, "createdAt", "ASC"],
      ],
    });

    return transformCommentsWithReplies(comments);
  } catch (error) {
    throw new Error("Error fetching comments: " + error.message);
  }
};

const getAllComments = async () => {
  try {
    const comments = await Comment.findAll();
    return comments;
  } catch (error) {
    throw new Error("Error fetching comments: " + error.message);
  }
};

module.exports = {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  getAllCommentsByArticleId,
};