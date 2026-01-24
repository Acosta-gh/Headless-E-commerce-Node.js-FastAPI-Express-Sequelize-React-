const express = require("express");
const router = express.Router();

// ======================================================================
//                   🖼️ Image Controllers
// ======================================================================
const { createImage, getAllImages } = require("@/controllers/image.controller");


// ======================================================================
//               🔐 Authentication & Authorization Middlewares
// ======================================================================
const {
  upload,
  multerErrorHandler,
} = require("@/middlewares/upload.middleware");
const { verifyTempIdToken } = require("@/middlewares/tempid.middleware");
const { isAdmin } = require("@/middlewares/isAdmin.middleware");
const { verifyJWT } = require("@/middlewares/verifyJWT.middleware");

// ======================================================================
//                      🖼️ Image Routes
// ======================================================================
// Create a new image
router.post(
  "/",
  verifyJWT,
  isAdmin,
  upload.single("image"),
  multerErrorHandler,
  verifyTempIdToken,
  createImage
);
// Get all images
router.get("/", getAllImages);

module.exports = router;
