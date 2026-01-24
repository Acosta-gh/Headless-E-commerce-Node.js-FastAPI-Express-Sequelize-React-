import React, { useState, useMemo } from "react";

import { useArticles } from "@/hooks/useArticles";
import ArticleCard from "@/components/common/ArticleCard";
import { BACKEND_URL } from "@/components/Constants";
import PaginationControls from "@/components/common/PaginationControls";
import { Fade } from "react-awesome-reveal";
import { useSearchParams } from "react-router-dom";

function AllArticles() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { articles, loading } = useArticles();

  // -------------------
  //      📦 State
  // -------------------
  // Pagination states
  const [basePaginationItems, setBasePaginationItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  let totalPages = Math.ceil(articles.length / itemsPerPage);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "";

  const filteredArticles = useMemo(() => {
    if (!searchQuery && !categoryFilter) return articles;

    if (searchQuery) {
      return articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.username
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter) {
      return articles.filter((article) =>
        article.categories.some((c) =>
          c.name.toLowerCase().includes(categoryFilter.toLowerCase())
        )
      );
    }

    return articles;
  }, [articles, searchQuery]);

  const recentArticles = useMemo(() => {
    const start = basePaginationItems;
    const end = start + itemsPerPage;
    return filteredArticles.slice(start, end);
  }, [filteredArticles, basePaginationItems, itemsPerPage]);

  totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

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
  return (
    <div className="mx-auto p-8 min-h-[55vh]">
      <Fade cascade triggerOnce duration={500}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ">
          <Fade  cascade damping={0.05} triggerOnce duration={700}>
            {recentArticles.map((article) => (
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
                date={new Date(article.createdAt).toLocaleDateString("es-ES")}
                articleId={article.id}
              />
            ))}
          </Fade>
        </div>
      </Fade>

      {!loading && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default AllArticles;
