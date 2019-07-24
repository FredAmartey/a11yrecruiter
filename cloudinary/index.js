const crypto = require('crypto');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'a11yrecruiter',
  api_key:'794967342833743',
  api_secret: process.env.CLOUDINARY_SECRET
});
const cloudinaryStorage = require('multer-storage-cloudinary');
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'uploads',
  allowedFormats: ['jpeg', 'jpg', 'png'],
  filename: function(req, file, cb){
    let buf = crypto.randomBytes(16);
    buf = buf.toString('hex');
    let uniqFileName = file.orignalname.replace(/\.jpeg|\.jpg|\.png/ig, '');
    uniqFileName += buf;
    cb(undefined, uniqFileName);
  }
});

module.exports = {
  cloudinary,
  storage
}
