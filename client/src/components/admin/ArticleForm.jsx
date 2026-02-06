import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Bold,
  Italic,
  Code,
  Link,
  List,
  Eye,
  DollarSign,
  Package,
  Hash,
  Star,
  X,
} from "lucide-react";

import ImageUploader from "@/components/admin/ImageUploader";
import { BACKEND_URL } from "@/components/Constants";

function ArticleForm({
  formData,
  onChange,
  bannerInputRef,
  imageInputRef,
  handleImageChange,
  handleImageUpload,
  imageData,
  isUploadingImage,
  handleSubmit,
  isSubmittingArticle,
  categories,
  selectedCategories,
  handleCategoryCheckbox,
  isEditing,
  cancelEditArticle,
  handleSubmitEdit,
}) {
  const [bannerPreview, setBannerPreview] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
    setBannerPreview(null);
  };

  const handleFormSubmitEdit = (e) => {
    e.preventDefault();
    handleSubmitEdit(e);
    setBannerPreview(null);
  };

  const handleCancelEdit = () => {
    cancelEditArticle();
    setBannerPreview(null);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBannerPreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
    onChange(e);
  };

  const insertMarkdown = (before, after = "") => {
    const textarea = document.getElementById("content");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newContent =
      formData.content.substring(0, start) +
      before +
      selectedText +
      after +
      formData.content.substring(end);

    onChange({
      target: {
        name: "content",
        value: newContent,
      },
    });

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  };

  const markdownButtons = [
    { icon: Bold, label: "Bold", onClick: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", onClick: () => insertMarkdown("*", "*") },
    { icon: Code, label: "Code", onClick: () => insertMarkdown("`", "`") },
    { icon: Link, label: "Link", onClick: () => insertMarkdown("[text](", ")") },
    { icon: List, label: "List", onClick: () => insertMarkdown("\n- ", "") },
  ];

  useEffect(() => {
    if (isEditing && formData.banner) {
      setBannerPreview(
        typeof formData.banner === "string"
          ? `${BACKEND_URL}${formData.banner}`
          : null
      );
    }
  }, [isEditing, formData.banner]);

  return (
    <div className="w-full">
      <form onSubmit={isEditing ? handleFormSubmitEdit : handleFormSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {isEditing ? "Edit Article" : "Create Article"}
              </CardTitle>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-medium">
                Title *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Article title..."
                value={formData.title}
                onChange={onChange}
                required
                className="h-9"
              />
            </div>

            {/* Product Info Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-medium flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  SKU *
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="PROD-001"
                  value={formData.sku}
                  onChange={onChange}
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock" className="text-xs font-medium flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  name="stock"
                  placeholder="0"
                  value={formData.stock}
                  onChange={onChange}
                  min="0"
                  step="1"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Banner */}
            <div className="space-y-2">
              <Label htmlFor="banner" className="text-xs font-medium">
                Banner Image
              </Label>
              <Input
                ref={bannerInputRef}
                id="banner"
                type="file"
                name="banner"
                accept="image/*"
                onChange={handleBannerChange}
                className="h-9 cursor-pointer"
              />
              {bannerPreview && (
                <div className="relative w-full h-40 rounded border overflow-hidden">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Badge>
                </div>
              )}
            </div>

            {/* Markdown Toolbar */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Markdown Tools</Label>
              <div className="flex flex-wrap gap-1 p-2 bg-muted rounded">
                {markdownButtons.map((btn) => (
                  <Button
                    key={btn.label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={btn.onClick}
                    title={btn.label}
                    className="h-8 w-8 p-0"
                  >
                    <btn.icon className="h-3.5 w-3.5" />
                  </Button>
                ))}
                <Separator orientation="vertical" className="mx-1 h-8" />
                <ImageUploader
                  imageInputRef={imageInputRef}
                  onImageChange={handleImageChange}
                  onUpload={handleImageUpload}
                  imageData={imageData}
                  isUploadingImage={isUploadingImage}
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-medium">
                Content *
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your article here..."
                value={formData.content}
                onChange={onChange}
                required
                className="min-h-48 font-mono text-xs resize-y"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Categories</Label>
              {categories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No categories available. Create one first.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {visibleCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center space-x-1.5 px-2 py-1.5 rounded border hover:bg-accent transition-colors"
                      >
                        <Checkbox
                          id={`cat-${cat.id}`}
                          checked={selectedCategories.includes(cat.id)}
                          onCheckedChange={() =>
                            handleCategoryCheckbox({
                              target: {
                                value: cat.id,
                                checked: !selectedCategories.includes(cat.id),
                              },
                            })
                          }
                          className="h-3.5 w-3.5"
                        />
                        <Label
                          htmlFor={`cat-${cat.id}`}
                          className="cursor-pointer text-xs font-medium"
                        >
                          {cat.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {categories.length > 8 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="h-7 text-xs"
                    >
                      {showAllCategories ? "Show Less" : `Show All (${categories.length})`}
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2 p-2 rounded border hover:bg-accent/50 transition-colors">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  onChange({
                    target: {
                      name: "featured",
                      type: "checkbox",
                      checked: checked,
                    },
                  })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="featured" className="cursor-pointer text-sm flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                Mark as Featured
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded border hover:bg-accent/50 transition-colors">
              <Checkbox
                id="isBulky"
                checked={formData.isBulky}
                onCheckedChange={(checked) =>
                  onChange({
                    target: {
                      name: "isBulky",
                      type: "checkbox",
                      checked,
                    },
                  })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="isBulky" className="cursor-pointer text-sm flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                Mark as Bulky
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmittingArticle}
              className="w-full h-9"
            >
              {isSubmittingArticle && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Update Article" : "Create Article"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default ArticleForm;