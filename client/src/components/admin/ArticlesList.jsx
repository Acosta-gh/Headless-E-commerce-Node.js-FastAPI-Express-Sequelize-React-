import React from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BACKEND_URL } from "@/components/Constants";
import { Link } from "react-router-dom";

import {
  Edit2,
  Trash2,
  Image as ImageIcon,
  Calendar,
  User,
  Star,
  Eye,
} from "lucide-react";

function ArticlesList({
  articles,
  articlesAmount,
  setEditingArticle,
  handleDeleteArticle,
}) {
  if (!articles || articles.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-lg bg-muted p-3 mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No articles available</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Start creating articles to populate this list
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Articles</h2>
          <p className="text-sm text-muted-foreground">
            Manage your published articles ({articlesAmount})
          </p>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {articles.map((article) => (
          <li key={article.id} className="group">
            <Card className="h-full overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary/50">
              {/* Banner Image Container */}
              <div className="relative w-full h-48 bg-muted overflow-hidden flex-shrink-0">
                {article.banner ? (
                  <img
                    src={`${BACKEND_URL}${article.banner}`}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted via-muted to-muted-foreground/20">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Badges Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-2">
                  {article.featured && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          This article is featured
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Badge className="bg-black/60 hover:bg-black/80 backdrop-blur-sm">
                    #{article.id}
                  </Badge>
                </div>
              </div>

              {/* Header */}
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {article.title}
                </CardTitle>
                {article.createdAt && (
                  <CardDescription className="flex items-center gap-1 text-xs mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardDescription>
                )}
              </CardHeader>

              {/* Content */}
              <CardContent className="pb-3 flex-1 space-y-3">
                {/* Preview */}
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {article.content?.substring(0, 120) || "No content available"}
                </p>

                {/* Categories */}
                <div className="space-y-2">
                  {article.categories && article.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {article.categories.slice(0, 3).map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                      {article.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex">
                      <Badge variant="outline" className="text-xs opacity-50">
                        No categories
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Author ID:
                  </span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {article.authorId}
                  </Badge>
                </div>
              </CardContent>

              {/* Footer Actions */}
              <CardFooter className="gap-2 pt-3 border-t border-border bg-muted/30">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setEditingArticle(article)}
                        className="flex-1 gap-1.5 cursor-pointer"
                        variant="default"
                        size="sm"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit this article</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                      >
                        <Link to={`/article/${article.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View article on site</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="flex-1 gap-1.5 cursor-pointer"
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete this article</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArticlesList;
