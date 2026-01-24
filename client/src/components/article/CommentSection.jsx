"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Trash } from "lucide-react";
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

  return (
    <section className="space-y-6">
      <div className="border-blog-border border-t pt-12">
        <h2 className="text-foreground mb-8 flex items-center gap-2 text-2xl font-bold">
          <MessageCircle className="h-6 w-6" />
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border-blog-border mb-12 rounded-xl border p-6"
        >
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="border-blog-border focus:border-primary min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" className="gap-2">
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => {
            const liked = userHasLiked(comment.likeIds);

            return (
              <div
                key={comment.id}
                className="bg-card border-blog-border hover:bg-blog-hover rounded-xl border p-6 transition-colors  overflow-hidden"
              >
                {/* Comment */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 outline flex-shrink-0">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${comment.user?.username}`}
                      alt={comment.user?.username || "User"}
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
                            ? "You"
                            : comment.user?.username}
                        </p>
                        <p className="text-blog-meta text-sm">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {(isOwner(comment.user?.id) || isAdmin) && (
                        <span className="text-sm font-medium text-primary flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blog-meta hover:text-primary cursor-pointer"
                            onClick={() => handleDeleteComment(comment)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </span>
                      )}
                    </div>

                    <p className="text-blog-content leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 transition-colors cursor-pointer ${
                          liked
                            ? "text-red-500 hover:text-red-600"
                            : "text-blog-meta hover:text-primary"
                        }`}
                        onClick={() => {
                          if (!isLiking) {
                            onAddLike(comment.id);
                          } else {
                            toast.error("Please wait, processing your like.");
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
                        className="text-blog-meta hover:text-primary cursor-pointer"
                        onClick={() => handleSetReplyingTo(comment.id)}
                      >
                        {replyingTo === comment.id ? "Cancel" : "Reply"}
                      </Button>
                    </div>

                    {replyingTo === comment.id && (
                      <form onSubmit={handleSubmitReply} className="mt-4">
                        <Textarea
                          placeholder={`Reply to ${comment.user?.username}...`}
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          className="border-blog-border focus:border-primary min-h-[80px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            type="submit"
                            className="gap-2 cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                            Post Reply
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
                          className="ml-0 pl-2.5 lg:ml-10 lg:pl-4 mt-4 border-l  overflow-hidden"
                        >
                          <div className="flex items-start space-x-4 min-w-0">
                            <Avatar className="h-8 w-8 outline flex-shrink-0">
                              <AvatarImage
                                src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${reply.user?.username}`}
                                alt={reply.user?.username || "User"}
                              />
                              <AvatarFallback>
                                {usernameInitial(reply.user?.username)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2  w-full">
                                <div className="min-w-0">
                                  {console.log(
                                    "Reply User ID:", reply.user?.id,
                                    "Is Owner:", isOwner(reply.user?.id)
                                  )}
                                  <p className="font-medium truncate">
                                    {isOwner(reply.user?.id)
                                      ? "You"
                                      : reply.user?.username}
                                  </p>
                                  <p className="text-blog-meta text-sm">
                                    {new Date(reply.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {(isOwner(reply.user?.id) || isAdmin) && (
                                  <span className="text-sm font-medium text-primary flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-blog-meta hover:text-primary cursor-pointer"
                                      onClick={() => onDeleteReply(reply)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </span>
                                )}
                              </div>

                              <p className="text-blog-content leading-relaxed break-words whitespace-pre-wrap ">
                                {reply.content}
                              </p>

                              <div className="flex items-center gap-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`gap-2 transition-colors cursor-pointer ${
                                    replyLiked
                                      ? "text-red-500 hover:text-red-600"
                                      : "text-blog-meta hover:text-primary"
                                  }`}
                                  onClick={() => {
                                    if (!isLiking) {
                                      onAddLike(reply.id);
                                    } else {
                                      toast.error(
                                        "Please wait, processing your like."
                                      );
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
        </div>
      </div>
    </section>
  );
}

export default CommentSection;
