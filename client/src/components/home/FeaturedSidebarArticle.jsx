import { Link } from "react-router-dom";

function FeaturedSidebarArticle({
  imageSrc,
  imageAlt,
  title,
  author,
  date,
  articleId,
}) {
  return (
    <Link to={`/article/${articleId}`} className="group flex gap-3 rounded-lg border border-transparent p-3 hover:border-primary/50 hover:bg-accent transition-all duration-200 cursor-pointer">
      {/* Thumbnail */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 justify-between min-w-0">
          <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h4>
          {(author || date) && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {author && <span>{author}</span>}
              {author && date && <span> • </span>}
              {date && <span>{date}</span>}
            </p>
          )}
        </div>
      </Link>
  );
}

export default FeaturedSidebarArticle;