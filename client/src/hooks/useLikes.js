import { useRef, useState } from "react";
import { toggleLike } from "@/services/like.services";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useLikes = (onCommentLikeChange, onArticleLikeChange) => {
  const [error, setError] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  /* 
  * Toggle like status for an article or comment
  @param {string} articleId - ID of the article
  @param {string} commentId - ID of the comment (optional)
  */
  const toggleLikeStatus = async (articleId, commentId) => {
    setIsLiking(true);

    if (!isAuthenticated()) {
      toast.error("You must be logged in to like.",
        {
            action:{
              label: "Close Notification",
              onClick: () => {},
            },
            duration: 2500,
          }
      );
      setIsLiking(false);
      return;
    }

    try {
      const response = await toggleLike(articleId, commentId, token);

      if (commentId && onCommentLikeChange) {
        onCommentLikeChange(commentId, {
          likeCount: response.likeCount,
          likeIds: response.likeIds,
          liked: response.liked,
        });
      }

      if (articleId && !commentId && onArticleLikeChange) {
        onArticleLikeChange(articleId, {
          likeCount: response.likeCount,
          likeIds: response.likeIds,
          liked: response.liked,
        });
      }

      toast.success(response.liked ? "Liked" : "Like removed",
         {
            action: {
              label: "Close Notification",
              onClick: () => {},
            },
            duration: 1500,
          }
      );
      return response;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        console.error("Error in toggleLikeStatus:", err);
      }
      setError(err);
      throw err;
    } finally {
      setIsLiking(false); 
    }
  };

  return {
    isLiking,
    error,
    toggleLikeStatus,
  };
};
