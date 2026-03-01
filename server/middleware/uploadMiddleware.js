const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { uploadBuffer } = require('../services/cloudinaryService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new ApiError(400, 'Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

const uploadRoomImages = upload.array('images', 8);

const processUploadedImages = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.length) {
    req.uploadedImages = [];
    next();
    return;
  }

  const uploads = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
  req.uploadedImages = uploads;
  next();
});

module.exports = {
  uploadRoomImages,
  processUploadedImages
};
