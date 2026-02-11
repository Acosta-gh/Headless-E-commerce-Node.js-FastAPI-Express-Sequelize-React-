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
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
        toast.error("Error al cargar el producto.");
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

  const handleAddReply = async (content, parentId) => {
    try {
      if (!articleId) return;
      await addComment({ articleId, commentId: parentId, content });
    } catch (error) {
      console.error("Error al agregar respuesta:", error);
    }
  };

  const handleAddComment = async (content) => {
    try {
      if (!articleId) return;
      await addComment({ articleId, content });
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  const handleAddToCart = () => {
    toast.success(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} agregadas al carrito`, {
      duration: 3000,
    });
  };

  const handleBuyNow = () => {
    toast.success("Redirigiendo al checkout...", {
      duration: 2000,
    });
  };

  // Get gallery images (banner + gallery type images)
  const getGalleryImages = () => {
    if (!article) return [];
    
    const images = [];
    
    // Add banner first
    if (article.banner) {
      images.push({
        url: `${BACKEND_URL}${article.banner}`,
        type: 'banner'
      });
    }
    
    // Add gallery images
    if (article.images) {
      const galleryImages = article.images
        .filter(img => img.type === 'gallery')
        .map(img => ({
          url: `${BACKEND_URL}${img.url}`,
          type: 'gallery'
        }));
      images.push(...galleryImages);
    }
    
    // Fallback to generated image if no images
    if (images.length === 0) {
      images.push({
        url: `https://api.dicebear.com/9.x/shapes/svg?seed=${article.title}`,
        type: 'fallback'
      });
    }
    
    return images;
  };

  // -------------------
  //     🖥️ Render
  // -------------------
  if (loading || !article) {
    return <Loading />;
  }

  const galleryImages = getGalleryImages();
  const currentImage = galleryImages[selectedImage]?.url || galleryImages[0]?.url;

  return (
    <div className="min-h-screen bg-background">

      <Fade cascade triggerOnce duration={500}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Product Header */}
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
            ).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
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
            // E-commerce specific props
            price={article.price}
            stock={article.stock}
            sku={article.sku}
            isBulky={article.isBulky}
            shortDescription={article.shortDescription}
            galleryImages={galleryImages}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            quantity={quantity}
            setQuantity={setQuantity}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
          />

          {/* Product Details */}
          <div className="mt-12">
            <Content
              content={article.content}
              coverImage={currentImage}
            />
          </div>

          {/* Reviews Section */}
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