const express = require('express');
const router = express.Router();
const { uploadBookFiles } = require('../middleware/upload');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const path = require('path');
const { generateBookSummary } = require('../services/bookSummaryService');
const fs = require('fs').promises;

// Add a new book (Author only)
router.post('/addBook', auth(['author']), uploadBookFiles, async (req, res) => {
  console.log('Received book upload request');
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('Request user:', req.user);

  try {
    // Parse book metadata
    const { name, isbn, genre } = JSON.parse(req.body.book);

    // Validate input
    if (!name || !isbn || !genre) {
      return res.status(400).json({ message: 'Missing required book details' });
    }

    // Get file paths from multer upload
    if (!req.files || !req.files.bookFile || !req.files.coverImage) {
      return res.status(400).json({ message: 'Book file or cover image missing from upload.' });
    }

    const bookFilePath = req.files.bookFile[0].path;
    const coverImagePath = req.files.coverImage[0].path;

    const book = new Book({
      name,
      isbn,
      genre,
      author: req.user._id,
      bookFile: bookFilePath,
      coverImage: coverImagePath
    });

    console.log('Attempting to save book:', book);
    await book.save();
    console.log('Book saved successfully');
    res.status(201).json(book);
  } catch (error) {
    console.error('Detailed error adding book:', error);
    res.status(500).json({
      message: 'Error adding book',
      error: error.message,
      details: error.stack
    });
  }
});

// Get all books
router.get('/list/allBooks', async (req, res) => {
  try {
    const books = await Book.find().populate('author', 'name');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

// Search books by name or genre
router.get('/search/Book', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const books = await Book.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { genre: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('author', 'name');
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books', error: error.message });
  }
});

// Search books by genre
router.get('/search/BookByGenre', async (req, res) => {
  try {
    const genre = req.query.search || '';
    const books = await Book.find({
      genre: { $regex: genre, $options: 'i' }
    }).populate('author', 'name');
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books by genre', error: error.message });
  }
});

// Create a book from the rich text editor
router.post('/create', auth(['author', 'customer']), async (req, res) => {
  try {
    console.log('Received book creation request from editor');
    
    const { title, genre, description, content, userId, userRole } = req.body;
    
    // Validate required fields
    if (!title || !genre || !content) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required book details (title, genre, or content)' 
      });
    }
    
    // Create a file path for the content
    const timestamp = Date.now();
    const contentDir = path.join(__dirname, '../uploads/books/content');
    const contentFilename = `${timestamp}-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
    const contentFilePath = path.join(contentDir, contentFilename);
    
    // Ensure the directory exists
    try {
      await fs.mkdir(contentDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Save the content to a file
    await fs.writeFile(contentFilePath, content);
    
    // Create a placeholder cover image path
    const placeholderCoverPath = path.join(__dirname, '../uploads/books/covers/placeholder.jpg');
    
    // Create the book in the database
    const book = new Book({
      name: title,
      genre,
      description: description || title,
      author: req.user._id,
      bookFile: contentFilePath.replace(/\\/g, '/'),
      coverImage: 'uploads/books/covers/placeholder.jpg',
      status: 'published',
      createdBy: userRole
    });
    
    await book.save();
    console.log('Book created successfully from editor');
    
    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      bookId: book._id
    });
  } catch (error) {
    console.error('Error creating book from editor:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  }
});

// Create a draft book (auto-save)
router.post('/create-draft', auth(['author', 'customer']), async (req, res) => {
  try {
    console.log('Received draft book creation request');
    
    const { title, genre, description, content, userId, userRole } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing content for draft' 
      });
    }
    
    // Create a file path for the draft content
    const timestamp = Date.now();
    const contentDir = path.join(__dirname, '../uploads/books/drafts');
    const contentFilename = `draft-${timestamp}-${(title || 'untitled').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
    const contentFilePath = path.join(contentDir, contentFilename);
    
    // Ensure the directory exists
    try {
      await fs.mkdir(contentDir, { recursive: true });
    } catch (err) {
      console.error('Error creating drafts directory:', err);
    }
    
    // Save the content to a file
    await fs.writeFile(contentFilePath, content);
    
    // Create the draft book in the database
    const book = new Book({
      name: title || 'Untitled Draft',
      genre: genre || 'Draft',
      description: description || 'Draft book in progress',
      author: req.user._id,
      bookFile: contentFilePath.replace(/\\/g, '/'),
      coverImage: 'uploads/books/covers/placeholder.jpg',
      status: 'draft',
      createdBy: userRole,
      isDraft: true
    });
    
    await book.save();
    console.log('Draft book created successfully');
    
    res.status(201).json({
      success: true,
      message: 'Draft saved successfully',
      draftId: book._id
    });
  } catch (error) {
    console.error('Error creating draft book:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving draft',
      error: error.message
    });
  }
});

// Update a draft book
router.post('/update-draft/:id', auth(['author', 'customer']), async (req, res) => {
  try {
    const draftId = req.params.id;
    console.log(`Updating draft book ${draftId}`);
    
    const { title, genre, description, content } = req.body;
    
    // Find the existing draft
    const existingDraft = await Book.findOne({ 
      _id: draftId,
      author: req.user._id,
      status: 'draft'
    });
    
    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to update it'
      });
    }
    
    // Update the content file
    try {
      await fs.writeFile(existingDraft.bookFile.replace(/\//g, path.sep), content);
    } catch (err) {
      console.error('Error updating draft file:', err);
      
      // If the file doesn't exist anymore, create a new one
      const timestamp = Date.now();
      const contentDir = path.join(__dirname, '../uploads/books/drafts');
      const contentFilename = `draft-${timestamp}-${(title || existingDraft.name).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
      const contentFilePath = path.join(contentDir, contentFilename);
      
      await fs.mkdir(contentDir, { recursive: true });
      await fs.writeFile(contentFilePath, content);
      
      existingDraft.bookFile = contentFilePath.replace(/\\/g, '/');
    }
    
    // Update other fields if provided
    if (title) existingDraft.name = title;
    if (genre) existingDraft.genre = genre;
    if (description) existingDraft.description = description;
    
    // Save the updated draft
    await existingDraft.save();
    console.log('Draft updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Draft updated successfully',
      draftId: existingDraft._id
    });
  } catch (error) {
    console.error('Error updating draft book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating draft',
      error: error.message
    });
  }
});

// Get user drafts
router.get('/user-drafts', auth(['author', 'customer']), async (req, res) => {
  try {
    console.log('Fetching user drafts');
    
    // Find all drafts for the current user
    const drafts = await Book.find({
      author: req.user._id,
      status: 'draft'
    }).select('name genre description createdAt updatedAt');
    
    res.status(200).json({
      success: true,
      drafts
    });
  } catch (error) {
    console.error('Error fetching user drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drafts',
      error: error.message
    });
  }
});

// Get draft content
router.get('/draft/:id', auth(['author', 'customer']), async (req, res) => {
  try {
    const draftId = req.params.id;
    console.log(`Fetching draft ${draftId}`);
    
    // Find the draft
    const draft = await Book.findOne({
      _id: draftId,
      author: req.user._id,
      status: 'draft'
    });
    
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or you do not have permission to access it'
      });
    }
    
    // Read the content file
    let content = '';
    try {
      content = await fs.readFile(draft.bookFile.replace(/\//g, path.sep), 'utf8');
    } catch (err) {
      console.error('Error reading draft file:', err);
      return res.status(404).json({
        success: false,
        message: 'Draft file not found',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      draft: {
        _id: draft._id,
        title: draft.name,
        genre: draft.genre,
        description: draft.description,
        content,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching draft content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching draft content',
      error: error.message
    });
  }
});

// Update a book (Author only)
// (Moved to bottom)
// Delete a book (Author only)
// (Moved to bottom)
// Get book by ID (MUST be after all specific routes)
// (Moved to bottom)

// Place these at the end:

// Get books by author ID
router.get('/authorBook/:authorId', auth(['author']), async (req, res) => {
  try {
    const books = await Book.find({ author: req.params.authorId });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching author books', error: error.message });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author', 'name bio');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book', error: error.message });
  }
});

// Update a book (Author only)
router.put('/:id', auth(['author']), uploadBookFiles, async (req, res) => {
  try {
    const updates = JSON.parse(req.body.book || '{}');
    // Only allow updating certain fields
    const allowedUpdates = ['name', 'genre', 'isbn'];
    const updatesToApply = {};
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        updatesToApply[update] = updates[update];
      }
    });
    if (req.files?.book?.[0]?.path) {
      updatesToApply.bookFile = req.files.book[0].path;
    }
    if (req.files?.coverImage?.[0]?.path) {
      updatesToApply.coverImage = req.files.coverImage[0].path;
    }
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { $set: updatesToApply },
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found or not authorized' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// Delete a book (Author only)
router.delete('/:id', auth(['author']), async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });
    if (!book) {
      return res.status(404).json({ message: 'Book not found or not authorized' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

// Get book PDF file
router.get('/pdf/:id', auth(['customer', 'author']), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Handle Azure Blob Storage URLs
    if (book.bookFile && book.bookFile.startsWith('http')) {
      console.log('Book file is in Azure, proxying file...');
      
      // Proxy the file request to avoid CORS issues
      const axios = require('axios');
      try {
        const response = await axios.get(book.bookFile, {
          responseType: 'arraybuffer'
        });
        
        // Set appropriate headers
        const contentType = response.headers['content-type'] || 'application/pdf';
        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `inline; filename="book-${req.params.id}.pdf"`);
        
        // Send the file data
        return res.send(response.data);
      } catch (axiosError) {
        console.error('Error proxying PDF from Azure:', axiosError.message);
        return res.status(500).json({ message: 'Error retrieving book file from cloud storage' });
      }
    }
    
    // Legacy support for local files
    try {
      res.sendFile(path.resolve(book.bookFile));
    } catch (fsError) {
      console.error('Error serving local book file:', fsError);
      return res.status(500).json({ message: 'Error serving book file' });
    }
  } catch (error) {
    console.error('Error serving book PDF:', error);
    res.status(500).json({ message: 'Error serving book PDF', error: error.message });
  }
});

// Generate book summary
router.get('/:id/summary', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Generate summary using the book summary service
    const summary = await generateBookSummary(book.bookFile);
    res.json({ summary });
    
  } catch (error) {
    console.error('Error generating summary:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      message: error.message || 'Error generating book summary',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get book cover image
router.get('/cover/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Default cover image path
    const defaultCoverPath = path.join(__dirname, '../public/default-cover.png');
    
    // Handle Azure Blob Storage URLs
    if (book.coverImage && book.coverImage.startsWith('http')) {
      console.log('Cover image is in Azure, proxying image...');
      
      // Proxy the image request to avoid CORS issues
      const axios = require('axios');
      try {
        const response = await axios.get(book.coverImage, {
          responseType: 'arraybuffer'
        });
        
        // Set appropriate headers
        const contentType = response.headers['content-type'] || 'image/jpeg';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        
        // Send the image data
        return res.send(response.data);
      } catch (axiosError) {
        console.error('Error proxying image from Azure:', axiosError.message);
        // Try to serve default image if available
        if (require('fs').existsSync(defaultCoverPath)) {
          return res.sendFile(defaultCoverPath);
        }
        return res.status(500).json({ message: 'Error retrieving cover image' });
      }
    }
    
    // Legacy support for local files
    try {
      // Check if file exists locally
      if (require('fs').existsSync(path.resolve(book.coverImage))) {
        return res.sendFile(path.resolve(book.coverImage));
      } else if (require('fs').existsSync(defaultCoverPath)) {
        return res.sendFile(defaultCoverPath);
      } else {
        return res.status(404).json({ message: 'Cover image not found' });
      }
    } catch (fsError) {
      console.error('Error serving local cover image:', fsError);
      return res.status(500).json({ message: 'Error serving cover image' });
    }
  } catch (error) {
    console.error('Error serving book cover image:', error);
    res.status(500).json({ message: 'Error serving book cover image', error: error.message });
  }
});

module.exports = router;
