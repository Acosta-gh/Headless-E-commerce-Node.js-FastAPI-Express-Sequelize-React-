import { useState, useCallback } from "react";
import { uploadImage, deleteImage as deleteImageService } from "@/services/image.services";
import { useAuth } from "@/hooks/useAuth";

export const useImage = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  /**
   * Upload a new image to the server
   * 
   * Soporta dos modos:
   * 1. File directo: uploadNewImage(file, tempIdToken)
   * 2. FormData: uploadNewImage(formData, tempIdToken)
   * 
   * @param {File|FormData} fileOrFormData - Archivo o FormData
   * @param {string} tempIdToken - Token temporal
   * @returns {Promise<Object|string>} Respuesta del servidor
   */
  const uploadNewImage = useCallback(async (fileOrFormData, tempIdToken) => {
    setLoading(true);
    try {
      const uploadedImageData = await uploadImage(
        fileOrFormData,
        tempIdToken,
        token
      );

      // Guardar URL si existe
      if (typeof uploadedImageData === "string") {
        setImageUrl(uploadedImageData);
      } else if (uploadedImageData?.url) {
        setImageUrl(uploadedImageData.url);
      }

      return uploadedImageData;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Delete an image by ID
   * Removes from database and filesystem
   * 
   * @param {number|string} imageId - The image ID to delete
   * @returns {Promise<boolean>} True if successful
   */
  const deleteImageById = useCallback(async (imageId) => {
    setLoading(true);
    try {
      await deleteImageService(imageId, token);
      return true;
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    imageUrl,
    loading,
    error,
    uploadNewImage,
    deleteImageById,
  };
};