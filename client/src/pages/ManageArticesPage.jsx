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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PaginationControls from "@/components/common/PaginationControls";

import ErrorAlert from "@/components/admin/ErrorAlert";
import ArticleForm from "@/components/admin/ArticleForm";
import CategoryManager from "@/components/admin/CategoryManager";
import ArticlesList from "@/components/admin/ArticlesList";

import { BACKEND_URL } from "@/components/Constants";
import { Fade } from "react-awesome-reveal";

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
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tempId: "",
    banner: null,
    featured: false,
  });
  const [imageData, setImageData] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);

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
  const [categoriesPerPage, setCategoriesPerPage] = useState(3);
  const [categoriesCurrentPage, setCategoriesCurrentPage] = useState(1);
  const categoriesTotalPages = Math.ceil(categories.length / categoriesPerPage);
  console.log("categoriesTotalPages:", categoriesTotalPages);

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
  // refs for file inputs so we can reset them after upload
  const bannerInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // -------------------
  //     📄 Effects
  // -------------------
  useEffect(() => {
    // Session expiration handling
    const interval = setInterval(() => {
      if (isAuthenticated && token) {
        toast.info("Your session has expired. Please log in again.");
        window.location.reload();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  // Set tempId in formData when it changes
  useEffect(() => {
    if (tempId) {
      setFormData((prevData) => ({ ...prevData, tempId }));
    } else {
      fetchTempId?.();
    }
  }, [tempId]);

  // Reset pagination if total pages decrease
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

  /*
   * Handle form input changes
   * @param {Event} e - The input change event
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "banner") {
      setFormData((prevData) => ({ ...prevData, banner: files?.[0] ?? null }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Cancel editing article
  const cancelEditArticle = () => {
    setIsEditing(false);
    setEditingArticleId(null);
    setFormData({
      title: "",
      content: "",
      tempId: tempId || "",
      banner: null,
      featured: false,
    });
    setSelectedCategories([]);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
    toast.info("Article editing cancelled");
  };

  /*
   * Handle image file selection
   * @param {Event} e - The file input change event
   */
  const handleImageChange = (e) => {
    const { files } = e.target;
    if (files && files[0]) {
      setImageData(files[0]);
    }
  };

  /* 
  * Handle editing a category
  + @param {Object} category - The category to edit
  */
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

  /*
   * Handle category form input changes
   * @param {Event} e - The input change event
   */
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  /*
   * Handle category submission
   * @param {Event} e - The form submission event
   */
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const newCat = await addCategory(categoryForm);
      setCategoryForm({ name: "", description: "" });
      toast.success("Categoría creada");
    } catch (err) {
      toast.error("Error creando categoría");
    }
  };

  /*
   * Handle category edit submission
   * @param {Event} e - The form submission event
   */
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

  /*
   * Handle deleting a category
   * @param {number} id - The ID of the category to delete
   */
  const handleDeleteCategory = async (id) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      try {
        await removeCategory(id);
        toast.success("Categoría eliminada");
      } catch (err) {
        toast.error("Error eliminando categoría");
      }
    }
  };

  // Handle category checkbox changes
  const handleCategoryCheckbox = (e) => {
    const value = Number(e.target.value);
    setSelectedCategories((prev) =>
      e.target.checked ? [...prev, value] : prev.filter((i) => i !== value)
    );
  };

  /*
   * Handle article form submission
   * @param {Event} e - The form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("tempId", formData.tempId);
      data.append("featured", formData.featured ? "true" : "false");

      if (formData.banner) {
        data.append("banner", formData.banner);
      }
      data.append("categoryIds", JSON.stringify(selectedCategories));

      console.log("Submitting article with data:", {
        title: formData.title,
        content: formData.content,
        tempId: formData.tempId,
        featured: formData.featured,
        banner: formData.banner,
        categoryIds: selectedCategories,
      });
      await createNewArticle(data, tempIdToken);
      toast.success("Article created successfully");

      setFormData({
        title: "",
        content: "",
        tempId: tempId || "",
        banner: null,
        featured: false,
      });

      setSelectedCategories([]);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      fetchArticles?.();
    } catch (error) {
      console.error("Error creating article:", error);
      toast.error("Error creating article");
    }
  };

  /*
   * Handle image upload
   * @param {Event} e - The form submission event
   */
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

      toast.success("Image uploaded successfully");
      setImageData(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setFormData((prevData) => ({
        ...prevData,
        content:
          prevData.content +
          `\n![alt text](${BACKEND_URL}${uploadedImage.url})`,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    }
  };

  /*
   * Handle setting an article for editing
   * @param {Object} article - The article to edit
   */
  const setEditingArticle = (article) => {
    toast.info("Article has been loaded to the form for editing");
    setEditingArticleId(article.id);
    console.log("Editing article:", article);
    setFormData({
      title: article.title,
      content: article.content,
      tempId: article.tempId || "",
      banner: article.banner || null,
      featured: article.featured,
    });
    setSelectedCategories(article.categories.map((cat) => cat.id));
    setIsEditing(true);
  };

  /*
   * Handle deleting an article
   * @param {string} id - The ID of the article to delete
   */
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

  /*
   * Handle submitting edited article
   * @param {Event} e - The form submission event
   */
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
    data.append("articleId", editingArticleId);

    console.log("featured value:", formData.featured);
    console.log("featured is boolean:", typeof formData.featured === "boolean");

    if (formData.banner instanceof File) {
      data.append("banner", formData.banner);
    } else if (formData.banner && typeof formData.banner === "string") {
      data.append("existingBanner", formData.banner);
    }

    data.append("categoryIds", JSON.stringify(selectedCategories));

    try {
      console.log("Editing article with data:", {
        title: formData.title,
        content: formData.content,
        tempId: formData.tempId,
        featured: formData.featured,
        banner: formData.banner,
        articleId: editingArticleId,
        categoryIds: selectedCategories,
      });

      const id = editingArticleId;

      await updateExistingArticle(id, data, tempIdToken);
      toast.success("Article updated successfully");

      setFormData({
        title: "",
        content: "",
        tempId: tempId || "",
        banner: null,
        featured: false,
      });
      setEditingArticleId(null);
      setSelectedCategories([]);
      setIsEditing(false);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }

      fetchArticles?.();
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Error updating article");
    }
  };

  // -------------------
  //      📦 State
  // -------------------
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);

  const isSubmittingArticle = articleLoading || tempIdLoading;
  const isUploadingImage = imageLoading || tempIdLoading;

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <Fade cascade damping={0.05} triggerOnce duration={400}>
        <ErrorAlert
          tempIdError={tempIdError}
          articleError={articleError}
          imageError={imageError}
        />

        <ArticleForm
          formData={formData}
          onChange={handleChange}
          bannerInputRef={bannerInputRef}
          imageInputRef={imageInputRef}
          handleImageChange={handleImageChange}
          handleImageUpload={handleImageUpload}
          imageData={imageData}
          isUploadingImage={isUploadingImage}
          handleSubmit={handleSubmit}
          isSubmittingArticle={isSubmittingArticle}
          categories={categories}
          selectedCategories={selectedCategories}
          handleCategoryCheckbox={handleCategoryCheckbox}
          isEditing={isEditing}
          cancelEditArticle={cancelEditArticle}
          handleSubmitEdit={handleSubmitEdit}
        />
        <Separator />
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
        <Separator />

        <div className="space-y-3">
          <h3 className="text-lg font-bold">Existing Articles</h3>
          <ArticlesList
            articles={paginatedArticles}
            articlesAmount={articles.length}
            setEditingArticle={setEditingArticle}
            handleSubmitEdit={handleSubmitEdit}
            isSubmittingArticle={isSubmittingArticle}
            isEditing={isEditing}
            handleDeleteArticle={handleDeleteArticle}
          />
        </div>
        {articlesTotalPages > 1 && (
          <PaginationControls
            currentPage={articlesCurrentPage}
            totalPages={articlesTotalPages}
            onPageChange={handleArticlePageChange}
          />
        )}
      </Fade>
    </div>
  );
}

export default AdminPanel;
