/*
 * ========================================================================================
 * ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
 * ========================================================================================
 */

import React, { useEffect, useMemo, useState, useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fade } from "react-awesome-reveal";
import { Skeleton } from "@/components/ui/skeleton";

import ArticleCard from "@/components/common/ArticleCard";
import PaginationControls from "@/components/common/PaginationControls";

import FeaturedSidebarArticle from "@/components/home/FeaturedSidebarArticle";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useArticles } from "@/hooks/useArticles";
import { BACKEND_URL } from "@/components/Constants";
import { ArrowRight, SquareArrowOutUpRight } from "lucide-react";

import { Link } from "react-router-dom";

const Home = () => {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { articles, loading } = useArticles();

  // -------------------
  //      📦 State
  // -------------------
  const [sortBy, setSortBy] = useState(() => {
    return sessionStorage.getItem("storeSortBy") || "recent";
  });

  // Pagination states
  const [basePaginationItems, setBasePaginationItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  // -------------------
  //      📄 Effects
  // -------------------
  useEffect(() => {
    sessionStorage.setItem("storeSortBy", sortBy);
  }, [sortBy]);

  // -------------------
  //      🧠 Memos
  // -------------------
  const featuredArticles = useMemo(() => {
    return articles
      .filter((article) => article.featured)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [articles]);

  const mainFeaturedArticle = featuredArticles[0];
  const otherFeaturedArticles = featuredArticles.slice(1, 5);

  const sortedArticles = useMemo(() => {
    if (sortBy === "popularity") {
      return [...articles].sort(
        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
      );
    } else {
      return [...articles].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
  }, [articles, sortBy]);

  // Paginated recent articles
  const recentArticles = sortedArticles.slice(
    basePaginationItems,
    basePaginationItems + itemsPerPage
  );

  // -------------------
  //     🖐️ Handlers
  // -------------------
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setBasePaginationItems((newPage - 1) * itemsPerPage);
  };

  // -------------------
  //     🖥️ Render
  // -------------------
  if (!articles || (articles.length === 0 && !loading)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center mb-20">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">No Articles Available</h2>
          <p className="text-muted-foreground">
            Articles will appear here once they are published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8 min-h-screen">
      {/* Main Featured Article */}

      <Fade cascade triggerOnce duration={500}>
        {mainFeaturedArticle && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-12">
            {/* Large Featured Post */}
            {loading && (
              <div className="relative h-[100px] overflow-hidden rounded-lg shadow-lg md:h-[500px] lg:col-span-2">
                <Skeleton className="h-full w-full" />
              </div>
            )}
            {!loading && (
              <Link
                to={`/article/${mainFeaturedArticle.id}`}
                className="relative h-[400px] overflow-hidden rounded-lg shadow-lg md:h-[500px] lg:col-span-2 group cursor-pointer"
              >
                <img
                  src={
                    mainFeaturedArticle.banner === null
                      ? `https://api.dicebear.com/9.x/shapes/svg?seed=${mainFeaturedArticle.title}`
                      : `${BACKEND_URL}${mainFeaturedArticle.banner}`
                  }
                  alt={mainFeaturedArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 text-white">
                  {mainFeaturedArticle.categories.length > 0 && (
                    <Badge className="mb-2 w-fit bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                      {mainFeaturedArticle.categories
                        .slice(0, 3)
                        .map((cat) => cat.name)
                        .join(", ")}
                    </Badge>
                  )}
                  <h2 className="text-2xl leading-tight font-bold md:text-3xl mb-2">
                    {mainFeaturedArticle.title}
                  </h2>
                  <p className="text-sm text-white/80">
                    Por{" "}
                    <span className="font-semibold">
                      {mainFeaturedArticle.author?.username}
                    </span>{" "}
                    •{" "}
                    {new Date(mainFeaturedArticle.createdAt).toLocaleDateString(
                      "es-ES"
                    )}
                  </p>
                </div>
              </Link>
            )}
            {/* Other Featured Posts Sidebar */}
            <div className="bg-card text-card-foreground space-y-6 rounded-lg border p-6 lg:col-span-1 h-fit sticky top-4">
              <h3 className="text-xl font-semibold">Other Featured Articles</h3>
              <div className="space-y-4">
                {loading && (
                  <>
                    <div className="flex flex-col space-y-3">
                      <Skeleton className="h-[80px] w-[80px] rounded-xl" />

                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </>
                )}
                {!loading && (
                  <>
                    {otherFeaturedArticles.length > 0 ? (
                      otherFeaturedArticles.map((article) => (
                        <FeaturedSidebarArticle
                          key={article.id}
                          imageSrc={
                            article.banner === null
                              ? `https://api.dicebear.com/9.x/shapes/svg?seed=${article.title}`
                              : `${BACKEND_URL}${article.banner}`
                          }
                          imageAlt={article.title}
                          title={article.title}
                          author={article.author?.username}
                          date={new Date(article.createdAt).toLocaleDateString(
                            "es-ES"
                          )}
                          articleId={article.id}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        There are no other featured articles.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Fade>

      {/* Recent Posts Section */}
      <Fade cascade triggerOnce duration={1500}>
        {recentArticles.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex flex-col gap-2 lg:items-center lg:flex-row lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {sortBy === "recent" ? "Recent Articles" : "Popular Articles"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Discover our {sortBy === "recent" ? "latest" : "most liked"}{" "}
                  articles
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">
                    Sort by:
                  </span>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Link to="/articles">
                <Button
                  variant="outline"
                  className="hidden lg:flex gap-2 cursor-pointer"
                >
                  View All Articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex flex-col space-y-3">
                      <Skeleton className="h-[225px] w-[450px] rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {!loading && (
                <>
                  {recentArticles.map((article) => (
                    <Fade cascade triggerOnce duration={500}>
                      <ArticleCard
                        key={article.id}
                        imageSrc={
                          article.banner === null
                            ? `https://api.dicebear.com/9.x/shapes/svg?seed=${article.title}`
                            : `${BACKEND_URL}${article.banner}`
                        }
                        imageAlt={article.title}
                        title={article.title}
                        description={
                          article.content
                            // Quita imágenes ![alt](url)
                            .replace(/!\[.*?\]\(.*?\)/g, "")
                            // Quita links [text](url)
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
                            // Quita encabezados #, ##, ###
                            .replace(/^#{1,6}\s+/gm, "")
                            // Quita listas - item, * item, 1. item
                            .replace(/^(\s*[-*+]|\d+\.)\s+/gm, "")
                            // Quita negrita y cursiva **bold**, *italic*, __bold__, _italic_
                            .replace(/(\*\*|__|\*|_)/g, "")
                            // Quita inline code `code`
                            .replace(/`([^`]+)`/g, "$1")
                            // Quita bloques de código ```code```
                            .replace(/```[\s\S]*?```/g, "")
                            // Quita blockquotes >
                            .replace(/^>\s+/gm, "")
                            // Reemplaza saltos de línea por espacio
                            .replace(/[\r\n]+/g, " ")
                            // Trunca a 150 caracteres
                            .substring(0, 150) + "..."
                        }
                        authorName={article.author?.username}
                        authorAvatarSrc={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${article.author?.username}`}
                        readTime={`${Math.ceil(
                          article.content.split(" ").length / 200
                        )} min`}
                        likeCount={article.likeCount || 0}
                        date={new Date(article.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                        articleId={article.id}
                      />
                    </Fade>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        <Link to="/articles">
          <Button
            variant="outline"
            className="w-full block gap-2 cursor-pointer flex lg:hidden mt-8 mb-4 justify-center"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </Fade>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Empty state for recent posts */}
      {recentArticles.length === 0 && !mainFeaturedArticle && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">There are no recent articles</p>
        </div>
      )}
    </div>
  );
};

export default Home;
