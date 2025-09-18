const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('upload: Starting Cloudinary upload for:', file.originalname);
    return {
      folder: 'aarit-jewels/products',
      allowed_formats: ['jpeg', 'jpg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'fill' }],
    };
  },
});

const fileFilter = (req, file, cb) => {
  console.log('upload: Received file:', file.originalname);
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
