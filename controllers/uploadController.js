const path = require('path');

const uploadMenuImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
    }

    // File is saved to disk by multer diskStorage (see uploadRoutes.js)
    const imageUrl = `/uploads/menu/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl,
      fileId: req.file.filename,
      thumbnailUrl: imageUrl
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadMenuImage };
