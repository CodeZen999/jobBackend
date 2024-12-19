const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure the directories exist
const logoDir = "./uploads/logo";
const avatarDir = "./uploads/avatar";
const coverDir = "./uploads/cover";

// Create directories if they don't exist
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true }); // Creates the logo folder if it doesn't exist
}
if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true }); // Creates the cover folder if it doesn't exist
}
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true }); // Creates the logo folder if it doesn't exist
}

// Multer configuration for logo
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logoDir); // Store logo in the "logo" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "logo-" + uniqueSuffix + extension); // e.g., logo-123456789.jpg
  },
});

// Multer configuration for cover
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coverDir); // Store cover in the "cover" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "cover-" + uniqueSuffix + extension); // e.g., cover-123456789.jpg
  },
});

// Multer configuration for cover
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir); // Store cover in the "avatar" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + extension); 
  },
});

// File filter for only accepting image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Initialize multer for logo and cover upload
const uploadLogo = multer({
  storage: logoStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// The upload route for logo
router.post("/logo", uploadLogo.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded or invalid file type" });
  }

  const filePath = `${process.env.UPLOAD_FILE_URL}/uploads/logo/${req.file.filename}`;
  res.status(200).send({
    message: "Logo uploaded successfully",
    filePath,
  });
});

// The upload route for cover
router.post("/cover", uploadCover.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded or invalid file type" });
  }

  const filePath = `${process.env.UPLOAD_FILE_URL}/uploads/cover/${req.file.filename}`;
  res.status(200).send({
    message: "Cover uploaded successfully",
    filePath,
  });
});

// The upload route for userAvartar
router.post("/avatar", uploadAvatar.single("image"), (req, res) => {
  console.log(`this is req.file` , req.file)
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded or invalid file type" });
  }

  const filePath = `${process.env.UPLOAD_FILE_URL}/uploads/avatar/${req.file.filename}`;
  res.status(200).send({
    message: "Avatar uploaded successfully",
    filePath,
  });
});

module.exports = router;
