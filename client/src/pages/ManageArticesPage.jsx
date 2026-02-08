/*
 * ========================================================================================
 * ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
 * ========================================================================================
 */

import React, { useEffect, useRef, useState } from "react";

// Hooks
import { useArticles } from "@/hooks/useArticles";
import { useImage } from "@/hooks/useImage";
import { useTempid } from "@/hooks/useTempid";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";

// Libraries
import { toast } from "sonner";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import PaginationControls from "@/components/common/PaginationControls";

import ErrorAlert from "@/components/admin/ErrorAlert";
import ArticleForm from "@/components/admin/ArticleForm";
import CategoryManager from "@/components/admin/CategoryManager";
import ArticlesList from "@/components/admin/ArticlesList";

import { BACKEND_URL } from "@/components/Constants";
import { Fade } from "react-awesome-reveal";
import { FileText, FolderTree, LayoutDashboard } from "lucide-react";

function AdminPanel() {
  // -------------------
  //      🪝 Hooks
  // -------------------
  const { token, isAuthenticated } = useAuth();

  const {
    articles,
    loading: articleLoading,
    error: articleError,
    fetchArticles,
    createNewArticle,
    updateExistingArticle,
    deleteArticle,
  } = useArticles();

  const {
    tempId,
    tempIdToken,
    loading: tempIdLoading,
    error: tempIdError,
    fetchTempId,
  } = useTempid();

  const {
    uploadNewImage,
    imageUrl,
    loading: imageLoading,
    error: imageError,
  } = useImage();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    addCategory,
    removeCategory,
    updateCategoryData,
  } = useCategories();

  // -------------------
  //      📦 State
  // -------------------
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tempId: "",
    banner: null,
    featured: false,
    isBulky: false,
    price: "",
    stock: "",
    sku: "",
  });
  const [imageData, setImageData] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("articles");
  const [existingGalleryImages, setExistingGalleryImages] = useState([]); // NEW: Store gallery images from edited article

  // -------------------
  // Pagination for Articles
  // -------------------
  const [basePaginationArticles, setBasePaginationArticles] = useState(0);
  const [articlesPerPage, setArticlesPerPage] = useState(8);
  const [articlesCurrentPage, setArticlesCurrentPage] = useState(1);
  const articlesTotalPages = Math.ceil(articles.length / articlesPerPage);

  const sortedArticles = articles.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const paginatedArticles = sortedArticles.slice(
    basePaginationArticles,
    basePaginationArticles + articlesPerPage
  );

  // -------------------
  // Pagination for Categories
  // -------------------
  const [basePaginationCategories, setBasePaginationCategories] = useState(0);
  const [categoriesPerPage, setCategoriesPerPage] = useState(6);
  const [categoriesCurrentPage, setCategoriesCurrentPage] = useState(1);
  const categoriesTotalPages = Math.ceil(categories.length / categoriesPerPage);

  const sortedCategories = categories.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const paginatedCategories = sortedCategories.slice(
    basePaginationCategories,
    basePaginationCategories + categoriesPerPage
  );

  // -------------------
  //      📚 Refs
  // -------------------
  const bannerInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // -------------------
  //     📄 Effects
  // -------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && token) {
        toast.info("Your session has expired. Please log in again.");
        window.location.reload();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tempId) {
      setFormData((prevData) => ({ ...prevData, tempId }));
    } else {
      fetchTempId?.();
    }
  }, [tempId, fetchTempId]);

  useEffect(() => {
    if (categoriesCurrentPage > categoriesTotalPages) {
      setCategoriesCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
      setBasePaginationCategories((prev) =>
        prev > 0 ? prev - categoriesPerPage : 0
      );
    }
    if (articlesCurrentPage > articlesTotalPages) {
      setArticlesCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
      setBasePaginationArticles((prev) =>
        prev > 0 ? prev - articlesPerPage : 0
      );
    }
  }, [categoriesTotalPages, articlesTotalPages]);

  // -------------------
  //    ✋ Handlers
  // -------------------
  const handleArticlePageChange = (newPage) => {
    setArticlesCurrentPage(newPage);
    setBasePaginationArticles((newPage - 1) * articlesPerPage);
  };

  const handleCategoryPageChange = (newPage) => {
    setCategoriesCurrentPage(newPage);
    setBasePaginationCategories((newPage - 1) * categoriesPerPage);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (name === "banner") {
      setFormData((prevData) => ({ ...prevData, banner: files?.[0] ?? null }));
    } else if (type === "checkbox") {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const cancelEditArticle = () => {
    setIsEditing(false);
    setEditingArticleId(null);
    setFormData({
      title: "",
      content: "",
      tempId: tempId || "",
      banner: null,
      featured: false,
      isBulky: false,
      price: "",
      stock: "",
      sku: "",
    });
    setSelectedCategories([]);
    setExistingGalleryImages([]); // Clear gallery images
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
    toast.info("Article editing cancelled");
  };

  const handleImageChange = (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      setImageData(files[0]);
    }
  };

  const handleEditCategory = (category) => {
    if (!category) {
      toast.info("Category editing cancelled");
      setIsEditingCategory(false);
      setCategoryForm({ id: null, name: "", description: "" });
      return;
    }
    toast.info(
      `Category "${category.name}" loaded for editing (ID: ${category.id})`
    );
    setIsEditingCategory(true);
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description,
    });
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const newCat = await addCategory(categoryForm);
      setCategoryForm({ name: "", description: "" });
      toast.success("Category created");
    } catch (err) {
      toast.error("Error creating category");
    }
  };

  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCategoryData(categoryForm);
      setCategoryForm({ name: "", description: "", id: null });
      setIsEditingCategory(false);
      toast.success("Category updated");
    } catch (err) {
      toast.error("Error updating category");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await removeCategory(id);
        toast.success("Category deleted");
      } catch (err) {
        toast.error("Error deleting category");
      }
    }
  };

  const handleCategoryCheckbox = (e) => {
    const value = Number(e.target.value);
    setSelectedCategories((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((i) => i !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("tempId", formData.tempId);
      data.append("featured", formData.featured ? "true" : "false");
      data.append("bulky", formData.isBulky ? "true" : "false");
      data.append("price", formData.price || "0");
      data.append("stock", formData.stock || "0");
      data.append("sku", formData.sku);

      if (formData.banner) {
        data.append("banner", formData.banner);
      }
      data.append("categoryIds", JSON.stringify(selectedCategories));

      await createNewArticle(data, tempIdToken);
      toast.success("Article created successfully");

      setFormData({
        title: "",
        content: "",
        tempId: tempId || "",
        banner: null,
        featured: false,
        isBulky: false,
        price: "",
        stock: "",
        sku: "",
      });

      setSelectedCategories([]);
      setExistingGalleryImages([]);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      fetchArticles?.();
      setActiveTab("manage");
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Error creating article");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageData) return;
    try {
      const data = new FormData();
      data.append("image", imageData);
      data.append("tempId", tempId);

      if (isEditing) {
        data.append("articleId", editingArticleId);
      }

      const uploadedImage = await uploadNewImage(data, tempIdToken);

      console.log("uploadedImage:" + uploadedImage);

      toast.success("Image uploaded successfully");
      setImageData(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      if (uploadedImage.type === "markdown") {
        setFormData((prevData) => ({
          ...prevData,
          content:
            prevData.content +
            `\n![alt text](${BACKEND_URL}${uploadedImage.url})`,
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    }
  };

  const setEditingArticle = (article) => {
    toast.info("Article loaded for editing");
    setEditingArticleId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      tempId: article.tempId || "",
      banner: article.banner || null,
      featured: article.featured,
      isBulky: article.isBulky,
      price: article.price || "",
      stock: article.stock || "",
      sku: article.sku || "",
    });
    setSelectedCategories(article.categories.map((cat) => cat.id));
    
    // Extract gallery images (type: "gallery")
    const galleryImages = article.images
      ? article.images.filter((img) => img.type === "gallery")
      : [];
    setExistingGalleryImages(galleryImages);
    
    setIsEditing(true);
    setActiveTab("articles");
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle(id);
        fetchArticles?.();
      } catch (error) {
        console.error("Error deleting article:", error);
        toast.error("Error deleting article");
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    if (!editingArticleId) {
      toast.error("No article selected for editing");
      return;
    }
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("tempId", formData.tempId);
    data.append("featured", formData.featured ? "true" : "false");
    data.append("bulky", formData.isBulky ? "true" : "false");
    data.append("articleId", editingArticleId);
    data.append("price", formData.price || "0");
    data.append("stock", formData.stock || "0");
    data.append("sku", formData.sku);

    console.log(data);

    if (formData.banner instanceof File) {
      data.append("banner", formData.banner);
    } else if (formData.banner && typeof formData.banner === "string") {
      data.append("existingBanner", formData.banner);
    }

    data.append("categoryIds", JSON.stringify(selectedCategories));

    try {
      const id = editingArticleId;

      await updateExistingArticle(id, data, tempIdToken);
      toast.success("Article updated successfully");

      setFormData({
        title: "",
        content: "",
        tempId: tempId || "",
        banner: null,
        featured: false,
        isBulky: false,
        price: "",
        stock: "",
        sku: "",
      });
      setEditingArticleId(null);
      setSelectedCategories([]);
      setExistingGalleryImages([]);
      setIsEditing(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      fetchArticles?.();
      setActiveTab("manage");
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Error updating article");
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);

  const isSubmittingArticle = articleLoading || tempIdLoading;
  const isUploadingImage = imageLoading || tempIdLoading;
  const isUploadingGallery = imageLoading || tempIdLoading;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto p-4 max-w-7xl">
        <Fade triggerOnce duration={400}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage articles, categories, and content
            </p>
          </div>

          <ErrorAlert
            tempIdError={tempIdError}
            articleError={articleError}
            imageError={imageError}
          />

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="articles" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Create Article</span>
                <span className="sm:hidden">Create</span>
              </TabsTrigger>
              <TabsTrigger value="manage" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Manage Articles</span>
                <span className="sm:hidden">Manage</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <FolderTree className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
                <span className="sm:hidden">Tags</span>
              </TabsTrigger>
            </TabsList>

            {/* Create/Edit Article Tab */}
            <TabsContent value="articles" className="space-y-4">
              <ArticleForm
                formData={formData}
                onChange={handleChange}
                bannerInputRef={bannerInputRef}
                imageInputRef={imageInputRef}
                handleImageChange={handleImageChange}
                handleImageUpload={handleImageUpload}
                imageData={imageData}
                isUploadingImage={isUploadingImage}
                isUploadingGallery={isUploadingGallery}
                handleSubmit={handleSubmit}
                isSubmittingArticle={isSubmittingArticle}
                categories={categories}
                selectedCategories={selectedCategories}
                handleCategoryCheckbox={handleCategoryCheckbox}
                isEditing={isEditing}
                cancelEditArticle={cancelEditArticle}
                handleSubmitEdit={handleSubmitEdit}
                uploadNewImage={uploadNewImage}
                tempId={tempId}
                tempIdToken={tempIdToken}
                existingImages={existingGalleryImages} // Pass existing gallery images
              />
            </TabsContent>

            {/* Manage Articles Tab */}
            <TabsContent value="manage" className="space-y-4">
              <ArticlesList
                articles={paginatedArticles}
                articlesAmount={articles.length}
                setEditingArticle={setEditingArticle}
                handleDeleteArticle={handleDeleteArticle}
              />
              {articlesTotalPages > 1 && (
                <PaginationControls
                  currentPage={articlesCurrentPage}
                  totalPages={articlesTotalPages}
                  onPageChange={handleArticlePageChange}
                />
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <CategoryManager
                categoryForm={categoryForm}
                onCategoryFormChange={handleCategoryFormChange}
                onCategorySubmit={handleCategorySubmit}
                onEditCategory={handleEditCategory}
                categories={paginatedCategories}
                categoryAmount={categories.length}
                categoriesLoading={categoriesLoading}
                onDeleteCategory={handleDeleteCategory}
                isEditingCategory={isEditingCategory}
                onEditCategorySubmit={handleEditCategorySubmit}
              />
              {categoriesTotalPages > 1 && (
                <PaginationControls
                  currentPage={categoriesCurrentPage}
                  totalPages={categoriesTotalPages}
                  onPageChange={handleCategoryPageChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </Fade>
      </div>
    </div>
  );
}

export default AdminPanel;