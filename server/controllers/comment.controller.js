const commentsService = require('@/services/comment.service');

async function createComment(req, res) {
  console.log("Creating comment with data:", req.body, "for user:", req.user);
  const comment = await commentsService.createComment(req.body, req.user.id);
  return res.status(201).json(comment);
}

async function deleteComment(req, res) {
  const deleted = await commentsService.deleteComment(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Comment not found' });
  return res.status(204).send();
}

async function getAllComments(req, res) {
  const comments = await commentsService.getAllComments();
  return res.status(200).json(comments);
}

async function getCommentById(req, res) {
  const comment = await commentsService.getCommentById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  return res.status(200).json(comment);
}

async function getAllCommentsByArticleId(req, res) {
  const comments = await commentsService.getAllCommentsByArticleId(req.query.articleId);
  return res.status(200).json(comments);
}

module.exports = {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  getAllCommentsByArticleId,
};