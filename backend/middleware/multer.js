// middleware/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = path.parse(file.originalname).name; // removes extension
    const timestamp = Date.now();
    return {
      folder: 'pg_images',
      allowed_formats: ['jpg', 'png'],
      public_id: `${originalName}-${timestamp}`, // 👈 original name first, then date
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
