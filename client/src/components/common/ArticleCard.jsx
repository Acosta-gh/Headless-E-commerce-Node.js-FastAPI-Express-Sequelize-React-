import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock , Heart} from "lucide-react";
import { Link } from "react-router-dom";

function ArticleCard({
  imageSrc,
  imageAlt,
  title,
  description,
  authorName,
  authorAvatarSrc,
  readTime,
  likeCount,
  category,
  articleId,
}) {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card text-card-foreground hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full">
      <Link to={`/article/${articleId}`}>
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {category && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="backdrop-blur-sm bg-black/40 text-white hover:bg-black/60 border-0"
              >
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-3 p-4">
          {/* Title */}
          <h3 className="text-lg leading-tight font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground line-clamp-3 text-sm flex-1">
            {description}
          </p>

          {/* Divider */}
          <div className="border-t border-border my-1" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarImage src={authorAvatarSrc} />
                <AvatarFallback className="text-xs font-semibold">
                  {getInitials(authorName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium leading-tight line-clamp-1">
                  {authorName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Heart className="h-3.5 w-3.5 relative bottom-[0.0005rem]" />
              {likeCount}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="h-3.5 w-3.5" />
              {readTime}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ArticleCard;
