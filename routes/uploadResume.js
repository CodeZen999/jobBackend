const multer = require("multer");
const express = require("express");
const fs = require("fs");
const path = require('path');
const router = express.Router();

// Set up multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory is at the project root
    const uploadDir = path.join(__dirname, '..', 'uploads', 'resume');  // Use '..' to go one level up from 'routes'
    // Create the 'uploads/resume' directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // The 'recursive' option ensures the entire path is created if it doesn't exist
    }
    cb(null, uploadDir);  // Save files in the 'uploads/resume' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext; // Filename will be a timestamp with the original extension
    cb(null, fileName);
  },
});

// File filter to only accept PDF files
const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Initialize multer with storage options and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// POST endpoint to handle resume upload
router.post('/upload', upload.single('resume'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // Successfully uploaded file
  res.status(200).json({
    message: 'File uploaded successfully!',
    file: req.file,
    fileUrl: `${process.env.UPLOAD_FILE_URL}/uploads/resume/${req.file.filename}`, 
  });
});

module.exports = router;