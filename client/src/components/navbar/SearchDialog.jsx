import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SquareArrowOutUpRight } from "lucide-react";
import { BACKEND_URL } from "@/components/Constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FeaturedSidebarArticle from "@/components/home/FeaturedSidebarArticle";
import { useArticles } from "@/hooks/useArticles";
import { useSearch } from "@/context/SearchContext";

function SearchDialog() {
  // -------------------
  //     🪝 Hooks
  // -------------------
  const { articles, loading } = useArticles();
  const { searchTerm, setSearchTerm } = useSearch();

  // -------------------
  //     📦 State
  // -------------------
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // -------------------
  //    🖐️ Handlers
  // -------------------
  const handleChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    let filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(term.toLowerCase()) ||
        article.author.username.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredArticles(filtered.slice(0, 5));
  };

  // -------------------
  //      🖥️ Render
  // -------------------
  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="border w-full cursor-pointer lg:border-0 lg:w-auto lg:mr-2">
          <Search />
          <span className="block lg:hidden">Search an article or author</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Search an author or article</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search..."
            className="flex-1"
            autoFocus
            onChange={handleChange}
          />
        </div>

        <div>
          <ul>
            {loading ? (
              <div className="flex flex-col space-y-3 p-1 pb-4">
                <Skeleton className="h-[80px] w-[80px] rounded-xl" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ) : (
              <>
                {filteredArticles.map((article) => (
                  <li key={article.id}>
                    <FeaturedSidebarArticle
                      key={article.id}
                      imageSrc={
                        article.banner
                          ? `${BACKEND_URL}${article.banner}`
                          : `https://api.dicebear.com/9.x/shapes/svg?seed=${article.title}`
                      }
                      imageAlt={article.title}
                      title={article.title}
                      author={article.author?.username}
                      date={new Date(article.createdAt).toLocaleDateString(
                        "es-ES"
                      )}
                      articleId={article.id}
                    />
                  </li>
                ))}
                {filteredArticles.length === 0 && searchTerm.trim() !== "" && (
                  <li className="p-4 text-center text-muted-foreground">
                    No coincidences found.
                  </li>
                )}

                {filteredArticles.length > 4 && (
                  <li className="mt-4 text-center">
                    <Button variant="outline">
                      <Link
                        to={`/articles?search=${searchTerm}`}
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">See all results</span>
                          <SquareArrowOutUpRight />
                        </div>
                      </Link>
                    </Button>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
