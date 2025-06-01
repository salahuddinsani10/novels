const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadBlob } = require('../services/azureBlobService');

// Configure storage for Azure Blob Storage
const memoryStorage = multer.memoryStorage();

// Generate a unique blob name for files
const generateUniqueBlobName = (prefix, originalname) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  return `${prefix}-${uniqueSuffix}${path.extname(originalname)}`;
};

// Instead of diskStorage, we'll use memoryStorage and upload to Azure later
// This is just for compatibility with existing code

// All file storage will use memory storage with Azure Blob upload

// File filter for book files
const bookFileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.epub', '.mobi'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, EPUB, and MOBI files are allowed for books'), false);
  }
};

// File filter for cover images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for covers'), false);
  }
};

// Initialize multer uploads with memory storage
const uploadBook = multer({
  storage: memoryStorage,
  fileFilter: bookFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

const uploadCover = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware for handling multiple file uploads to Azure Blob Storage
const uploadBookFiles = (req, res, next) => {
  console.log('Setting up book upload middleware with Azure Blob Storage');
  
  // Use memory storage for files before uploading to Azure
  const upload = multer({
    storage: memoryStorage, // Use memory storage for Azure uploads
    fileFilter: (req, file, cb) => {
      const bookAllowedTypes = ['.pdf', '.epub', '.mobi'];
      const imageAllowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
      const ext = path.extname(file.originalname).toLowerCase();

      if (file.fieldname === 'bookFile' && bookAllowedTypes.includes(ext)) {
        cb(null, true);
      } else if (file.fieldname === 'coverImage' && imageAllowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${ext}`), false);
      }
    },
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB limit for book, 5MB for cover
    }
  }).fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]);

  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (req.files) {
        console.log('Files uploaded to memory, now uploading to Azure Blob Storage...');
        
        // Upload book file to Azure if it exists
        if (req.files.bookFile && req.files.bookFile[0]) {
          const bookFile = req.files.bookFile[0];
          const bookBlobName = generateUniqueBlobName('book', bookFile.originalname);
          
          // Get content type based on file extension
          const bookContentType = {
            '.pdf': 'application/pdf',
            '.epub': 'application/epub+zip',
            '.mobi': 'application/x-mobipocket-ebook'
          }[path.extname(bookFile.originalname).toLowerCase()] || 'application/octet-stream';
          
          console.log(`Uploading book file ${bookBlobName} to Azure...`);
          
          try {
            // Upload to Azure Blob Storage
            const bookUrl = await uploadBlob(
              bookFile.buffer,
              bookBlobName,
              bookContentType,
              'uploads' // container name - must match the one configured
            );
            
            console.log(`✅ Book file uploaded successfully to Azure: ${bookUrl}`);
            
            // Replace the file info with the Azure URL
            req.files.bookFile[0].path = bookUrl;
            req.files.bookFile[0].azure = true;
          } catch (azureError) {
            console.error(`❌ Failed to upload book file to Azure: ${azureError.message}`);
            // Fallback to local storage
            const localDir = path.join(__dirname, '../uploads/books');
            if (!fs.existsSync(localDir)) {
              fs.mkdirSync(localDir, { recursive: true });
            }
            
            const localPath = path.join(localDir, bookBlobName);
            fs.writeFileSync(localPath, bookFile.buffer);
            
            // Store the local path
            const relativePath = `uploads/books/${bookBlobName}`;
            req.files.bookFile[0].path = relativePath;
            console.log(`📁 Fallback: Book file saved locally at ${relativePath}`);
          }
        }
        
        // Upload cover image to Azure if it exists
        if (req.files.coverImage && req.files.coverImage[0]) {
          const coverImage = req.files.coverImage[0];
          const coverBlobName = generateUniqueBlobName('cover', coverImage.originalname);
          
          // Get content type based on file extension
          const coverContentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
          }[path.extname(coverImage.originalname).toLowerCase()] || 'image/jpeg';
          
          console.log(`Uploading cover image ${coverBlobName} to Azure...`);
          
          try {
            // Upload to Azure Blob Storage
            const coverUrl = await uploadBlob(
              coverImage.buffer,
              coverBlobName,
              coverContentType,
              'uploads' // container name - must match the one configured
            );
            
            console.log(`✅ Cover image uploaded successfully to Azure: ${coverUrl}`);
            
            // Replace the file info with the Azure URL
            req.files.coverImage[0].path = coverUrl;
            req.files.coverImage[0].azure = true;
          } catch (azureError) {
            console.error(`❌ Failed to upload cover image to Azure: ${azureError.message}`);
            // Fallback to local storage
            const localDir = path.join(__dirname, '../uploads/covers');
            if (!fs.existsSync(localDir)) {
              fs.mkdirSync(localDir, { recursive: true });
            }
            
            const localPath = path.join(localDir, coverBlobName);
            fs.writeFileSync(localPath, coverImage.buffer);
            
            // Store the local path
            const relativePath = `uploads/covers/${coverBlobName}`;
            req.files.coverImage[0].path = relativePath;
            console.log(`📁 Fallback: Cover image saved locally at ${relativePath}`);
          }
        }
        
        // Log final paths
        console.log('Final file paths for database:');
        if (req.files.bookFile && req.files.bookFile[0]) {
          console.log(`Book file path: ${req.files.bookFile[0].path}`);
        }
        if (req.files.coverImage && req.files.coverImage[0]) {
          console.log(`Cover image path: ${req.files.coverImage[0].path}`);
        }
      }
      
      next();
    } catch (error) {
      console.error('File processing error:', error);
      return res.status(500).json({ 
        message: 'Error processing uploaded files', 
        error: error.message 
      });
    }
  });
};

// Create wrapper for user profile image upload with Azure Blob Storage
const uploadUserProfile = multer({
  storage: memoryStorage, // Use memory storage for Azure uploads
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('profilePicture');

// Middleware to process the uploaded profile picture and store in Azure Blob Storage
const processProfileUpload = async (req, res, next) => {
  if (!req.file) {
    console.log('No profile picture uploaded, continuing with registration...');
    return next(); // No file uploaded, continue
  }

  try {
    console.log(`Processing profile picture upload to Azure for file: ${req.file.originalname}`);
    console.log(`File size: ${req.file.size} bytes, MIME type: ${req.file.mimetype}`);
    
    // Generate a unique blob name
    const profileBlobName = generateUniqueBlobName('profile', req.file.originalname);
    
    // Get content type based on file extension
    const contentType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    }[path.extname(req.file.originalname).toLowerCase()] || 'image/jpeg';
    
    console.log(`Uploading profile picture ${profileBlobName} with content type ${contentType}`);
    
    try {
      // Upload to Azure Blob Storage
      const profileUrl = await uploadBlob(
        req.file.buffer,
        profileBlobName,
        contentType,
        'uploads' // container name - must match the one configured
      );
      
      console.log(`\u2705 Profile picture uploaded successfully to Azure: ${profileUrl}`);
      
      // Replace the file path with the Azure URL
      req.file.path = profileUrl;
      req.file.azure = true;
    } catch (azureError) {
      console.error(`\u274c Failed to upload profile picture to Azure: ${azureError.message}`);
      // Fallback to local storage
      const localDir = path.join(__dirname, '../uploads/profiles');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      const localPath = path.join(localDir, profileBlobName);
      fs.writeFileSync(localPath, req.file.buffer);
      
      // Store the local path
      const relativePath = `uploads/profiles/${profileBlobName}`;
      req.file.path = relativePath;
      console.log(`\ud83d\udcc1 Fallback: Profile picture saved locally at ${relativePath}`);
    }
    
    next();
  } catch (error) {
    console.error('Error processing profile picture:', error);
    
    // Set a default profile path if processing fails
    const defaultProfilePath = 'public/default-profile.png';
    req.file.path = defaultProfilePath;
    
    // Continue with registration despite error
    console.log(`Continuing with registration using default profile image: ${defaultProfilePath}`);
    next();
  }
};


// PDF filter
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Not a PDF! Please upload a PDF file.'), false);
  }
};

// Create Azure-based image uploader
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create Azure-based PDF uploader
const uploadPDF = multer({
  storage: memoryStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

module.exports = {
  uploadBook,
  uploadCover,
  uploadBookFiles,
  uploadUserProfile,
  processProfileUpload,
  uploadImage,
  uploadPDF
};
