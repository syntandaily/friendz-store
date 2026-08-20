const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../assets/images/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `media-${uniqueSuffix}${ext}`);
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image and video files are allowed!'), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: fileFilter
});

/**
 * POST /api/upload
 * Upload a single image or video file manually
 */
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const relativePath = `assets/images/uploads/${req.file.filename}`;
    const fileUrl = `/${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      filePath: relativePath,
      url: fileUrl,
      fileType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      originalName: req.file.originalname
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
