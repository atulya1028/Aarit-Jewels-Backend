const cloudinary = require('./config/cloudinary');
cloudinary.uploader.upload('/Users/atulyaagrawal/Desktop/test.jpg', { folder: 'aarit-jewels/products' }, (error, result) => {
  console.log('Cloudinary Test:', error || result);
});