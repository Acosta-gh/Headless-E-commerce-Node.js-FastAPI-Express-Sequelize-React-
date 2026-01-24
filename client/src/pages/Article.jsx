"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import Header from "@/components/article/Header";
import Content from "@/components/article/Content";
import CommentSection from "@/components/article/CommentSection";
import Loading from "@/components/Loading";

import { Fade } from "react-awesome-reveal";

import { useArticles } from "@/hooks/useArticles";
import { useComments } from "@/hooks/useComments";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";

import { BACKEND_URL } from "@/components/Constants";

function Article() {
  // -------------------
  //    🧭 Navigation
  // -------------------
  const navigate = useNavigate();

  // -------------------
  //      📚 Refs
  // -------------------
  const commentSectionRef = useRef(null);

  // -------------------
  //      📦 State
  // -------------------
  const [commentAmount, setCommentAmount] = useState(0);

  // -------------------
  //      🪝 Hooks
  // -------------------
  const {
    getArticle,
    loading,
    updateArticleLikes,
    individualArticle: article,
  } = useArticles();

  const {
    comments,
    setComments,
    addComment,
    fetchAllCommentsByArticleId,
    updateCommentLikes,
    removeComment,
  } = useComments();

  const { isLiking, toggleLikeStatus } = useLikes(
    updateCommentLikes,
    updateArticleLikes
  );

  const { userId } = useAuth();
  const { articleId } = useParams();

  // -------------------
  //     📄 Effects
  // -------------------
  // Sync fetched comments with local state
  useEffect(() => {
    setComments(comments);
    setCommentAmount(comments.length);
  }, [comments, setComments]);

  // Fetch article and comments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!articleId) return;
        await getArticle(articleId);
        await fetchAllCommentsByArticleId(articleId);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load article.");
      }
    };

    fetchData();
  }, [articleId, getArticle, fetchAllCommentsByArticleId]);

  // -------------------
  //    ✋ Handlers
  // -------------------
  const handleScrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  /*
  * Handle adding a like to an article or comment
  @param {string} commentId - ID of the comment (optional)
  */
  const handleAddLike = useCallback(
    async (commentId) => {
      if (!articleId) return;
      try {
        await toggleLikeStatus(articleId, commentId ?? undefined);
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    [articleId, toggleLikeStatus]
  );

  /*
  + * Handle adding a reply to a comment
  + @param {string} content - Content of the reply
  + @param {string} parentId - ID of the parent comment
  + */
  const handleAddReply = async (content, parentId) => {
    try {
      if (!articleId) return;
      await addComment({ articleId, commentId: parentId, content });
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  /*
  * Handle adding a new comment
  @param {string} content - Content of the comment
  */
  const handleAddComment = async (content) => {
    try {
      if (!articleId) return;
      await addComment({ articleId, content });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // -------------------
  //     🖥️ Render
  // -------------------
  if (loading || !article) {
    return <Loading />;
  }

  return (
    <div className="bg-background min-h-screen">
      <Fade cascade triggerOnce duration={500}>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Header
            categories={article.categories}
            title={article.title}
            author={
              article.author?.username
                ? article.author
                : { username: article.author }
            }
            publishedDate={(article.updatedAt
              ? new Date(article.updatedAt)
              : new Date(article.createdAt)
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            onAddLike={handleAddLike}
            onBack={() => navigate("/")}
            likeIds={article.likeIds}
            currentUserId={userId}
            likeCount={article.likeCount}
            commentAmount={commentAmount}
            handleScrollToComments={handleScrollToComments}
            liked={article.liked}
            isLiking={isLiking}
          />

          <div className="mt-16">
            <Content
              content={article.content}
              coverImage={
                article.banner === null
                  ? `https://api.dicebear.com/9.x/shapes/svg?seed=${article.title}`
                  : `${BACKEND_URL}${article.banner}`
              }
            />
          </div>

          <div className="mt-16" ref={commentSectionRef}>
            <CommentSection
              comments={comments}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
              onAddLike={handleAddLike}
              onDeleteComment={removeComment}
              onDeleteReply={removeComment}
              currentUserId={userId}
              isLiking={isLiking}
            />
          </div>
        </div>
      </Fade>
    </div>
  );
}

export default Article;
