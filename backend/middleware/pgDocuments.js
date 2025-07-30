// middleware/documentUpload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Define allowed MIME types
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Configure Cloudinary storage with enhanced debugging
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_'); // Sanitize spaces
    const extension = path.parse(file.originalname).ext.toLowerCase(); // e.g., ".pdf"
    const timestamp = Date.now();
    const publicId = `${originalName}-${timestamp}${extension}`; // e.g., "AssignmentSamridhi-123456789.pdf"

    // Debug logs
    console.log('Original filename:', file.originalname);
    console.log('Parsed name:', originalName);
    console.log('Extension:', extension);
    console.log('Generated public_id:', publicId);
    console.log('Detected MIME type:', file.mimetype);

    return {
      folder: 'pg_documents',
      resource_type: 'raw',
      public_id: publicId,
    };
  },
});

// File filter with validation
const fileFilter = (req, file, cb) => {
  console.log('File MIME type:', file.mimetype); // Log for debugging
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`), false);
  }
};

// Set file size limit (15MB)
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const documentUpload = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
  // Handle multer errors
  onError: (err, next) => {
    console.error('Multer error:', err.message);
    next(err);
  },
});

module.exports = documentUpload;