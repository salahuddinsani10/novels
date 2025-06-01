const express = require('express');
const { uploadImage, uploadPDF } = require('../middleware/upload');

const router = express.Router();

// Route to upload an image
router.post('/upload-image', uploadImage.single('image'), (req, res) => {
  res.status(200).json({
    message: 'Image uploaded successfully!',
    filePath: req.file.path,
  });
});

// Route to upload a PDF
router.post('/upload-pdf', uploadPDF.single('pdf'), (req, res) => {
  res.status(200).json({
    message: 'PDF uploaded successfully!',
    filePath: req.file.path,
  });
});

module.exports = router;