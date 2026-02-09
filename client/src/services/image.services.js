/*
 * ========================================================================================
 * Image Service - Frontend
 * ========================================================================================
 */

import { BACKEND_URL } from "@/components/Constants";

/**
 * Fetch all images (optional, for admin panel)
 */
export const getImages = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/image`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

/**
 * Upload a new image (File or FormData)
 * @param {File|FormData} fileOrFormData - The image file or FormData
 * @param {string} tempIdToken - Temporary ID token for session
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Image data with url and type
 */
export const uploadImage = async (fileOrFormData, tempIdToken, token) => {
  try {
    const formData = fileOrFormData instanceof FormData 
      ? fileOrFormData 
      : (() => {
          const fd = new FormData();
          fd.append("image", fileOrFormData);
          return fd;
        })();

    const response = await fetch(`${BACKEND_URL}/api/v1/image`, {
      method: "POST",
      headers: {
        "x-tempid-token": tempIdToken,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Delete an image by ID
 * Removes from database and filesystem
 * @param {number|string} imageId - The image ID to delete
 * @param {string} token - Auth token (for authorization)
 * @returns {Promise<void>}
 */
export const deleteImage = async (imageId, token) => {
  try {
    if (!imageId) {
      throw new Error("Image ID is required");
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/image/${imageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // No content expected on successful delete
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};