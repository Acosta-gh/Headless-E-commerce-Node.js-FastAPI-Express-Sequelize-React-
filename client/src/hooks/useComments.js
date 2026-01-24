/*
 * ========================================================================================
 * ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
 * ========================================================================================
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllCommentsByArticleId,
  createComment,
  deleteComment,
} from "@/services/comment.services";
import { toast } from "sonner";

export const useComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token, isAuthenticated } = useAuth();

  /* 
  * Fetch all comments for a specific article
  @param {string} articleId - ID of the article
  */
  const fetchAllCommentsByArticleId = useCallback(
    async (articleId) => {
      setLoading(true);
      try {
        const data = await getAllCommentsByArticleId(articleId);
        setComments(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  /*
  * Add a new comment or reply
  @param {Object} commentData - Data for the new comment or reply
  */
  const addComment = useCallback(
    async (commentData) => {
      setLoading(true);

      if (!isAuthenticated()) {
        toast.error("You must be logged in to post a comment.", {
          action: {
            label: "Close Notification",
            onClick: () => {},
          },
           duration: 2500,
        });
        setLoading(false);
        return;
      }

      try {
        const newComment = await createComment(commentData, token);

        if (newComment.commentId) {
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === newComment.commentId
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c
            )
          );
        } else {
          setComments((prevComments) => [newComment, ...prevComments]);
        }

        toast.success(
          newComment.commentId
            ? "Reply added successfully."
            : "Comment added successfully.",
          {
            action: {
              label: "Close Notification",
              onClick: () => {},
            },
            duration: 1500,
          }
        );
        return newComment;
      } catch (err) {
        if (error.response && error.response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          console.error("Error adding comment:", err);
        }
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token]
  );

  /* 
  * Update likes for a comment or reply
  @param {string} commentId - ID of the comment or reply
  @param {Object} likeData - Data containing updated like information
  */
  const updateCommentLikes = useCallback((commentId, likeData) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likeCount: likeData.likeCount,
            likeIds: likeData.likeIds || [],
          };
        }
        const updatedReplies = comment.replies?.map((reply) =>
          reply.id === commentId
            ? {
                ...reply,
                likeCount: likeData.likeCount,
                likeIds: likeData.likeIds || [],
              }
            : reply
        );
        return updatedReplies
          ? { ...comment, replies: updatedReplies }
          : comment;
      })
    );
  }, []);

  /*
  * Remove a comment or reply
  @param {Object} comment - Comment or reply object to be removed
  */
  const removeComment = useCallback(
    async (comment) => {
      setLoading(true);
      try {
        await deleteComment(comment.id, token);

        if (comment.commentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === comment.commentId
                ? {
                    ...c,
                    replies: c.replies.filter((r) => r.id !== comment.id),
                  }
                : c
            )
          );
          toast.success("Reply deleted successfully");
          setLoading(false);
          return;
        } else {
          setComments((prev) => prev.filter((c) => c.id !== comment.id));
          toast.success(
            "Comment deleted successfully",
            {
              action: {
                label: "Close Notification",
                onClick: () => {},
              },
               duration: 1500,
            },
          );
        }
      } catch (err) {
        toast.error("Failed to delete comment");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    comments,
    setComments,
    loading,
    error,
    fetchAllCommentsByArticleId,
    addComment,
    removeComment,
    updateCommentLikes,
  };
};
