import axios from "axios";

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1/";
const IMAGES_URL = API_URL + "image/";

/** Fetch all images
 * @returns {Promise<Array>} List of images
 * @throws {Error} Network or server error
 */
export const getImages = async () => {
  const response = await axios.get(IMAGES_URL);
  return response.data;
};

/** Upload a new image
 * @param {FormData} imageData - Image file data
 * @param {string} tempIdToken - Temporary ID to associate the image with future articles
 * @returns {Promise<string>} URL of the uploaded image
 * @throws {Error} Network or server error
 */
export const uploadImage = async (imageData, tempIdToken, token) => {
  console.log("Uploading image with tempIdToken:", tempIdToken);
  const response = await axios.post(IMAGES_URL, imageData, {
    headers: {
      "x-tempid-token": tempIdToken,
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Upload response:", response.data);
  return response.data;
};
