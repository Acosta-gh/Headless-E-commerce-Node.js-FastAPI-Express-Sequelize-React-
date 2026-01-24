/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

/**
 * Transforms likes array into likeIds and likeCount so that it can be easily consumed by the client by adding:
 * - likeIds: array of userIds who liked the item
 * - likeCount: total number of likes
 * @param {Array} likes - likes array
 * @returns {Object} {likeIds, likeCount}
 */
const transformLikes = (likes = []) => {
  const likeIds = likes.map((l) => l.userId);
  return {
    likeIds,
    likeCount: likeIds.length,
  };
};

/**
 * Transforms a comment with likes so that it includes likeIds and likeCount
 * @param {Object} commentData - comment data
 * @returns {Object} transformed comment
 */
const transformComment = (commentData) => {
  if (!commentData) return null;

  const { likes = [], ...rest } = commentData;
  return {
    ...rest,
    ...transformLikes(likes),
  };
};

/**
 * Transforms an array of comments with their replies so that each comment and reply includes likeIds and likeCount
 * @param {Array} comments - array of comments
 * @returns {Array} transformed comments with replies
 */
const transformCommentsWithReplies = (comments) => {
  return comments.map((comment) => {
    const commentData = comment.toJSON ? comment.toJSON() : comment;
    const transformed = transformComment(commentData);

    if (commentData.replies && Array.isArray(commentData.replies)) {
      transformed.replies = commentData.replies.map((reply) =>
        transformComment(reply)
      );
    }

    return transformed;
  });
};

/**
 * Transforms an article with likes so that it includes likeIds and likeCount by using transformLikes so that it can be easily consumed by the client
 * @param {Object|Array} articleData - article data or array of articles
 * @returns {Object|Array} transformed article or array of articles
 */
const transformArticle = (articleData) => {
  if (!articleData) return null;
  if (Array.isArray(articleData)) return articleData.map(transformArticle);

  const { likes = [], ...rest } = articleData;
  return { ...rest, ...transformLikes(likes) };
};



module.exports = {
  transformLikes,
  transformComment,
  transformCommentsWithReplies,
  transformArticle,
};
