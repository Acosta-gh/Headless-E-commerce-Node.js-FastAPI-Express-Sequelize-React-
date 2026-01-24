/*
* ========================================================================================
* ⚠️ This file's code was generated partially or completely by a Large Language Model (LLM).
* ========================================================================================
*/

import { useState, useEffect, useCallback } from "react";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle as deleteArticleService,
} from "@/services/article.services";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

/*
 *
 * Normalize like IDs to ensure consistency.
 * This function converts each ID to a string, handling cases where IDs
 * might be objects containing userId or id properties.
 */
const normalizeIds = (ids) =>
  (ids ?? []).map((id) => {
    const v = typeof id === "object" ? id?.userId ?? id?.id ?? id : id;
    return String(v);
  });
const unique = (arr) => Array.from(new Set(arr));

export const useArticles = () => {
  const [articles, setArticles] = useState([]);
  const [individualArticle, setIndividualArticle] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  //const decoded = token ? jwtDecode(token) : null;

  /* 
  * Fetch all articles from the server
  */
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticles();
      setArticles(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 
  * Fetch a single article by ID
  @param {string} id - Article ID
  */
  const getArticle = useCallback(async (id) => {
    setLoading(true);
    console.log("Fetching article with ID:", id);
    try {
      const article = await getArticleById(id);

      //console.log("Fetched article data:", article);
      setIndividualArticle(article);
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  * Create a new article
  @param {Object} articleData - Data for the new article
  @param {string} tempIdToken - Temporary ID token for unauthenticated users
  */
  const createNewArticle = async (articleData, tempIdToken) => {
    setLoading(true);
    try {
      const newArticle = await createArticle(articleData, tempIdToken, token);
      setArticles((prevArticles) => [newArticle, ...prevArticles]);
      return newArticle;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
  * Delete an article by ID
  @param {string} id - Article ID
  */
  const deleteArticle = async (id) => {
    setLoading(true);
    try {
      await deleteArticleService(id, token);
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== id)
      );
      toast.success("Article deleted successfully");
    } catch (error) {
      setError(error);
      toast.error("Failed to delete article");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
  * Update an existing article
  @param {string} id - Article ID
  @param {Object} articleData - Updated article data
  */
  const updateExistingArticle = async (id, articleData, tempIdToken) => {
    setLoading(true);
    try {
      const updatedArticle = await updateArticle(
        id,
        articleData,
        tempIdToken,
        token
      );
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === id ? updatedArticle : article
        )
      );
      return updatedArticle;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /*
  * Update likes for an article
  @param {string} articleId - ID of the article
  @param {Object} likeData - Data containing updated like information
  */
  const updateArticleLikes = (articleId, likeData) => {
    const targetId = String(articleId);
    const normalizedIds = unique(normalizeIds(likeData.likeIds || []));

    setArticles((prevArticles) =>
      prevArticles.map((article) =>
        String(article.id) === targetId
          ? {
              ...article,
              likeCount: likeData.likeCount,
              likeIds: normalizedIds,
              liked:
                typeof likeData.liked === "boolean"
                  ? likeData.liked
                  : article.liked,
            }
          : article
      )
    );

    setIndividualArticle((prev) => {
      if (!prev || String(prev.id) !== targetId) return prev;
      return {
        ...prev,
        likeCount: likeData.likeCount,
        likeIds: normalizedIds,
        liked:
          typeof likeData.liked === "boolean" ? likeData.liked : prev.liked,
      };
    });
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    individualArticle,
    setIndividualArticle,
    loading,
    error,
    fetchArticles,
    createNewArticle,
    updateExistingArticle,
    deleteArticle,
    getArticle,
    updateArticleLikes,
  };
};
