const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadMenuImage } = require('../controllers/uploadController');
const { protectOwner } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'menu');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    cb(isImage ? null : new Error('Only image files are allowed.'), isImage);
  }
});

router.post('/menu-image', protectOwner, upload.single('image'), uploadMenuImage);

module.exports = router;
