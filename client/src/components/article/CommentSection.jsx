"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Trash, Star } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

function CommentSection({
  comments = [],
  onAddComment,
  onAddReply,
  onAddLike,
  onDeleteComment,
  onDeleteReply,
  currentUserId,
  likesLoading = false,
  isLiking,
}) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState("");
  const { isAdmin } = useAuth();

  const handleSetReplyingTo = (commentId) => {
    setNewReply("");
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    if (newReply.trim() && replyingTo != null) {
      onAddReply(newReply.trim(), replyingTo);
      setReplyingTo(null);
      setNewReply("");
    }
  };

  const handleDeleteComment = (comment) => onDeleteComment(comment);

  useEffect(() => {
    if (replyingTo === null) setNewReply("");
  }, [replyingTo]);

  const normalizeIds = (ids) =>
    (ids ?? []).map((id) => {
      const val = typeof id === "object" ? id?.userId ?? id?.id ?? id : id;
      return String(val);
    });

  const userHasLiked = (likeIds) => {
    if (!currentUserId || !likeIds || likeIds.length === 0) return false;
    return normalizeIds(likeIds).includes(String(currentUserId));
  };

  const isOwner = (authorId) =>
    currentUserId && authorId
      ? String(authorId) === String(currentUserId)
      : false;

  const usernameInitial = (username) =>
    username?.charAt(0)?.toUpperCase() || "?";

  // Calculate average rating (mock for now)
  const averageRating = comments.length > 0 ? 4.5 : 0;

  return (
    <section className="space-y-6">
      <div className="border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Opiniones ({comments.length})
          </h2>
          {comments.length > 0 && (
            <div className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-muted/50">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({comments.length} {comments.length === 1 ? 'opinión' : 'opiniones'})
              </span>
            </div>
          )}
        </div>

        {/* Add Review Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border rounded-xl p-6 mb-12"
        >
          <div className="space-y-4">
            <Textarea
              placeholder="Compartí tu experiencia con este producto..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Publicar opinión
              </Button>
            </div>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-6">
          {comments.map((comment) => {
            const liked = userHasLiked(comment.likeIds);

            return (
              <div
                key={comment.id}
                className="bg-card border rounded-xl p-6 overflow-hidden"
              >
                {/* Comment */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 outline flex-shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${comment.user?.username}`}
                      alt={comment.user?.username || "Usuario"}
                    />
                    <AvatarFallback>
                      {usernameInitial(comment.user?.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {isOwner(comment.user?.id)
                            ? "Vos"
                            : comment.user?.username}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {(isOwner(comment.user?.id) || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          onClick={() => handleDeleteComment(comment)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Mock rating display */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </div>

                    <p className="leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${
                          liked
                            ? "text-red-500"
                            : ""
                        }`}
                        onClick={() => {
                          if (!isLiking) {
                            onAddLike(comment.id);
                          } else {
                            toast.error("Esperá, procesando tu like.");
                          }
                        }}
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={liked ? "currentColor" : "none"}
                        />
                        {comment.likeCount || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetReplyingTo(comment.id)}
                      >
                        {replyingTo === comment.id ? "Cancelar" : "Responder"}
                      </Button>
                    </div>

                    {replyingTo === comment.id && (
                      <form onSubmit={handleSubmitReply} className="mt-4">
                        <Textarea
                          placeholder={`Responder a ${comment.user?.username}...`}
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button type="submit" className="gap-2">
                            <Send className="h-4 w-4" />
                            Publicar respuesta
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies?.map((reply) => {
                      const replyLiked = userHasLiked(reply.likeIds);
                      return (
                        <div
                          key={reply.id}
                          className="ml-0 pl-2.5 lg:ml-10 lg:pl-4 mt-4 border-l overflow-hidden"
                        >
                          <div className="flex items-start space-x-4 min-w-0">
                            <Avatar className="h-8 w-8 outline flex-shrink-0">
                              <AvatarImage
                                src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${reply.user?.username}`}
                                alt={reply.user?.username || "Usuario"}
                              />
                              <AvatarFallback>
                                {usernameInitial(reply.user?.username)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2 w-full">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">
                                    {isOwner(reply.user?.id)
                                      ? "Vos"
                                      : reply.user?.username}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {(isOwner(reply.user?.id) || isAdmin) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                                    onClick={() => onDeleteReply(reply)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <p className="leading-relaxed break-words whitespace-pre-wrap">
                                {reply.content}
                              </p>

                              <div className="flex items-center gap-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`gap-2 ${
                                    replyLiked
                                      ? "text-red-500"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    if (!isLiking) {
                                      onAddLike(reply.id);
                                    } else {
                                      toast.error("Esperá, procesando tu like.");
                                    }
                                  }}
                                  disabled={likesLoading}
                                >
                                  <Heart
                                    className="h-4 w-4"
                                    fill={replyLiked ? "currentColor" : "none"}
                                  />
                                  {reply.likeCount || 0}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <div className="text-center py-12 border rounded-xl bg-muted/50">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Todavía no hay opiniones
              </h3>
              <p className="text-muted-foreground text-sm">
                Sé el primero en compartir tu experiencia con este producto
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CommentSection;