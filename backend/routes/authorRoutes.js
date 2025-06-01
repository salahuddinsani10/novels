const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const Author = require('../models/Author');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Add new author (alias for register)
router.post('/addAuthor', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if author already exists
    let author = await Author.findOne({ email });
    if (author) {
      return res.status(400).json({ message: 'Author already exists' });
    }

    // Create new author
    author = new Author({
      name,
      email,
      password
    });

    await author.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: author._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password in response
    author.password = undefined;

    res.status(201).json({
      token,
      author: author._id
    });
  } catch (error) {
    console.error('Add author error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Author registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if author already exists
    let author = await Author.findOne({ email });
    if (author) {
      return res.status(400).json({ message: 'Author already exists' });
    }

    // Create new author
    author = new Author({
      name,
      email,
      password
    });

    await author.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: author._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    author.password = undefined;

    res.status(201).json({
      token,
      author
    });
  } catch (error) {
    console.error('Author registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update the login logic to use the Author model
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Changed to body instead of query for better security

    // Check if author exists
    const author = await Author.findOne({ email });
    if (!author) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await author.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: author._id, role: 'author' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    author.password = undefined;

    res.json({
      token,
      author: author._id
    });
  } catch (error) {
    console.error('Author login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get author profile (protected)
router.get('/me', auth(['author']), async (req, res) => {
  try {
    const author = await Author.findById(req.user._id).select('-password');
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get author's books
router.get('/:id/books', async (req, res) => {
  try {
    const books = await Book.find({ author: req.params.id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching author books', error: error.message });
  }
});

// Google login for authors
router.post('/google-login', async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if author with this email already exists
    let author = await Author.findOne({ email });
    
    if (author) {
      // Author exists, update their Google ID if not set
      if (!author.googleId) {
        author.googleId = googleId;
        author.profilePicture = picture || author.profilePicture;
        await author.save();
      }
    } else {
      // Create new author with Google info
      // Generate a secure random password since they're using Google login
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      author = new Author({
        name,
        email,
        password: hashedPassword,
        googleId,
        profilePicture: picture || undefined
      });
      
      await author.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: author._id, role: 'author' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Don't send password in response
    author.password = undefined;
    
    res.json({
      token,
      author: author._id
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login', error: error.message });
  }
});

// Update author profile (protected)
router.put('/me', auth(['author']), async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'bio', 'profilePicture'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    // Don't allow email change to an existing email
    if (updates.includes('email')) {
      const existingAuthor = await Author.findOne({ email: req.body.email });
      if (existingAuthor && existingAuthor._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const author = await Author.findById(req.user._id);
    
    updates.forEach(update => {
      author[update] = req.body[update];
    });

    await author.save();
    
    // Don't send password in response
    author.password = undefined;
    
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get author profile image by ID
router.get('/authorImage/:userId', async (req, res) => {
  try {
    // Find the author by ID
    const author = await Author.findById(req.params.userId).select('profilePicture');
    
    // Default profile image URL (can be changed to an Azure default image URL)
    const defaultProfileUrl = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    
    if (!author) {
      console.log('Author not found, redirecting to default profile image');
      return res.redirect(defaultProfileUrl);
    }
    
    // If no profile picture or if it's a local path (not yet migrated to Azure), redirect to default
    if (!author.profilePicture) {
      console.log('No author profile picture, redirecting to default');
      return res.redirect(defaultProfileUrl);
    }
    
    // If the profile picture is already an Azure URL (starts with https://), redirect to it
    if (author.profilePicture.startsWith('https://')) {
      return res.redirect(author.profilePicture);
    }
    
    // For backward compatibility - if it's a local path, try to serve it
    // but in the future, all profile pictures should be Azure URLs
    try {
      const imagePath = path.resolve(author.profilePicture);
      const fs = require('fs');
      
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      } else {
        console.log('Author profile picture not found, redirecting to default');
        return res.redirect(defaultProfileUrl);
      }
    } catch (error) {
      console.error('Error serving local profile picture:', error);
      return res.redirect(defaultProfileUrl);
    }
  } catch (error) {
    console.error('Error fetching author image:', error);
    res.redirect('https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y');
  }
});

module.exports = router;
