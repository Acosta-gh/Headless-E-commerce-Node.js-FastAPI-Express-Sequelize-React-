import {
  Link as LinkIcon,
  Heart,
  Pocket,
  MessageCircle,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ShareButton from "@/components/article/ShareButton";
import { Link } from "react-router-dom";

function normalizeIds(ids) {
  return (ids ?? []).map((id) => {
    const v = typeof id === "object" ? id?.userId ?? id?.id ?? id : id;
    return String(v);
  });
}

function userHasLiked(currentUserId, likeIds) {
  if (!currentUserId || !likeIds || likeIds.length === 0) return false;
  const normalized = normalizeIds(likeIds);
  return normalized.includes(String(currentUserId));
}

function Header({
  categories = [],
  title,
  author,
  onAddLike,
  publishedDate,
  onBack,
  likeIds,
  currentUserId,
  likeCount,
  commentAmount,
  handleScrollToComments,
  liked: likedProp,
  isLiking = false,
}) {
  const liked =
    typeof likedProp === "boolean"
      ? likedProp
      : userHasLiked(currentUserId, likeIds);

  categories = categories.slice(0, 10); // Limit to 10 categories for display

  return (
    <header className="space-y-6">
      {categories.map((cat) => (
        <Link
          to={`/articles?category=${encodeURIComponent(cat.name)}`}
          key={cat.id}
        >
          <Badge className="bg-accent text-accent-foreground mr-2">
            {cat.name}
          </Badge>
        </Link>
      ))}

      <h1 className="text-foreground text-4xl leading-15 font-bold tracking-tight md:text-4xl lg:text-5xl">
        {title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 outline">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${author?.username}`}
              alt={typeof author === "string" ? author : author?.username}
              className="object-cover"
            />
            <AvatarFallback>
              {typeof author === "string" ? author : author?.username}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              by {typeof author === "string" ? author : author?.username}
            </p>
            <p className="text-muted-foreground text-sm">{publishedDate}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={`rounded-full transition-colors cursor-pointer ${
              liked ? "text-red-500 hover:text-red-600" : ""
            }`}
            onClick={() => {
              if (!isLiking) onAddLike(null);
            }}
            disabled={isLiking}
            aria-pressed={liked}
            aria-busy={isLiking}
          >
            <Heart fill={liked ? "red" : "none"} />
            <span>{likeCount ?? 0}</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full transition-colors cursor-pointer"
            onClick={handleScrollToComments}
          >
            <MessageCircle className="h-4 w-4" />
            <p>{commentAmount}</p>
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
            Share this
          </span>
          <ShareButton url={window.location.href} />
        </div>
      </div>
      <hr />
    </header>
  );
}

export default Header;
