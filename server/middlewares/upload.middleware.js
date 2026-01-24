const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.resolve(__dirname, "../uploads");
console.log("Upload directory:", uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // file name: <timestamp>-<random>-<sanitized-name><ext>
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jpg",
    "image/svg+xml",
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(
    new Error(
      "Invalid file type. Only images (jpg, jpeg, png, webp, gif, svg) are allowed."
    )
  );
};

// 5MB limit
const limits = {
  fileSize: 5 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });

function multerErrorHandler(err, _req, res, next) {
  if (err) {
    const isMulterError = err.name === "MulterError";
    return res.status(400).json({
      error: "Error uploading file",
      message: isMulterError ? err.message : err.message || "Invalid file",
    });
  }
  return next();
}

module.exports = { upload, multerErrorHandler };
