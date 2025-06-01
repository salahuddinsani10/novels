const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const { uploadUserProfile, processProfileUpload } = require('../middleware/upload');
const Author = require('../models/Author');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');

// User registration
router.post('/register', uploadUserProfile, processProfileUpload, async (req, res) => {
  try {
    const { name, email, password, role, bio } = req.body;

    console.log(`Processing registration for ${name} (${email}) as ${role}`);

    if (!role || !['author', 'customer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either author or customer' });
    }

    // Check if email exists in either User, Author, or Customer models
    let existingUser = await User.findOne({ email });
    let existingAuthor = await Author.findOne({ email });
    let existingCustomer = await Customer.findOne({ email });
    
    if (existingUser || existingAuthor || existingCustomer) {
      console.log(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'Email already registered. Please login or use a different email.' });
    }

    if (role === 'author') {
      const author = new Author({
        name,
        email,
        password,
        bio,
        profilePicture: req.file ? req.file.path : undefined
      });

      await author.save();
      console.log(`Author ${name} registered successfully with ID: ${author._id}`);
      
      const token = jwt.sign(
        { id: author._id, role: 'author' },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );
      author.password = undefined;
      return res.status(201).json({ token, author });
    }

    // Store customer data in the Customer table
    const customer = new Customer({
      name,
      email,
      password,
      profilePicture: req.file ? req.file.path : undefined
    });

    await customer.save();
    console.log(`Customer ${name} registered successfully with ID: ${customer._id}`);
    
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    customer.password = undefined;
    res.status(201).json({ token, customer });
  } catch (error) {
    console.error('User registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already registered. Please login or use a different email.', 
        error: 'Duplicate email' 
      });
    }
    
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Duplicate logic for /addUser
router.post('/addUser', uploadUserProfile, processProfileUpload, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      profilePicture: req.file ? req.file.path : undefined
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    user.password = undefined;

    res.status(201).json({
      token,
      user
    });
  } catch (error) {
    console.error('User registration error (/addUser):', error);
    console.error('Request body:', req.body);
    console.error('Uploaded file:', req.file);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update the login logic to support both customer and author
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Changed to body instead of query for better security

    // Check if customer exists
    let user = await Customer.findOne({ email });
    let role = 'customer';

    // If not a customer, check if the user is an author
    if (!user) {
      user = await Author.findOne({ email });
      role = 'author';
    }

    // If no user is found
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    // Don't send password in response
    user.password = undefined;

    res.json({
      token,
      user: user._id,
      role
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile (protected)
router.get('/me', auth(['user']), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's reading history
router.get('/reading-history', auth(['user']), async (req, res) => {
  try {
    // This would be implemented based on how you track reading history
    // For now, returning an empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reading history', error: error.message });
  }
});

// Get user's reviews
router.get('/reviews', auth(['user']), async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('book', 'name coverImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});




// Update user profile (protected)
router.put('/me', auth(['user']), async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'profilePicture'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    // Don't allow email change to an existing email
    if (updates.includes('email')) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const user = await User.findById(req.user._id);
    
    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();
    
    // Don't send password in response
    user.password = undefined;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get customer username by ID
router.get('/Customer/UserName/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found', name: 'Unknown User' });
    }
    res.json(user.name || 'Unknown User');
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).json({ message: 'Server error', name: 'Unknown User', error: error.message });
  }
});

// Get customer profile image by ID
router.get('/customerImage/:userId', async (req, res) => {
  try {
    // First try to find the user in the Customer model
    let user = await Customer.findById(req.params.userId).select('profilePicture');
    
    // If not found in Customer model, try the User model
    if (!user) {
      user = await User.findById(req.params.userId).select('profilePicture');
    }
    
    // Path to default profile image (stored locally in backend)
    const defaultProfilePath = path.join(__dirname, '../public/default-profile.png');
    
    if (!user) {
      console.log('User not found, serving default profile image');
      return res.sendFile(defaultProfilePath);
    }
    
    // If no profile picture, serve default image
    if (!user.profilePicture) {
      console.log('No profile picture, serving default');
      return res.sendFile(defaultProfilePath);
    }
    
    console.log(`Found profile picture: ${user.profilePicture}`);
    
    // Handle Azure Blob Storage URLs (starts with https://)
    if (user.profilePicture.startsWith('http')) {
      console.log('Profile is in Azure, proxying image...');
      
      // Proxy the image request to avoid CORS issues
      const axios = require('axios');
      try {
        const response = await axios.get(user.profilePicture, {
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
        return res.sendFile(defaultProfilePath);
      }
    }
    
    // Legacy handling for local files (for backward compatibility)
    try {
      const imagePath = path.resolve(user.profilePicture);
      // Check if file exists locally
      const fs = require('fs');
      if (fs.existsSync(imagePath)) {
        console.log('Serving local profile image:', imagePath);
        return res.sendFile(imagePath);
      } else {
        console.log('Local profile not found, serving default');
        return res.sendFile(defaultProfilePath);
      }
    } catch (fsError) {
      console.error('Error serving local profile:', fsError);
      return res.sendFile(defaultProfilePath);
    }
  } catch (error) {
    console.error('Error fetching user image:', error);
    // Serve default image on error
    const defaultProfilePath = path.join(__dirname, '../public/default-profile.png');
    res.sendFile(defaultProfilePath);
  }
});

// Alias routes to match frontend API calls
router.get('/UserName/:userId', async (req, res) => {
  try {
    // First try to find the user in the Customer model
    let user = await Customer.findById(req.params.userId).select('name');
    
    // If not found in Customer model, try the User model
    if (!user) {
      user = await User.findById(req.params.userId).select('name');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.name);
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// This route is an alias of the one above, using the same proxy approach
router.get('/image/:userId', async (req, res) => {
  try {
    // Try to find the user in either Customer or User model
    let user = await Customer.findById(req.params.userId).select('profilePicture');
    if (!user) {
      user = await User.findById(req.params.userId).select('profilePicture');
    }
    
    // Path to default profile image (stored locally)
    const defaultProfilePath = path.join(__dirname, '../public/default-profile.png');
    
    if (!user || !user.profilePicture) {
      console.log('User or profile picture not found, serving default');
      return res.sendFile(defaultProfilePath);
    }
    
    // Handle Azure Blob Storage URLs
    if (user.profilePicture.startsWith('http')) {
      console.log('Profile is in Azure, proxying image...');
      
      // Proxy the image request to avoid CORS issues
      const axios = require('axios');
      try {
        const response = await axios.get(user.profilePicture, {
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
        return res.sendFile(defaultProfilePath);
      }
    }
    
    // Legacy support for local files
    try {
      const imagePath = path.resolve(user.profilePicture);
      if (require('fs').existsSync(imagePath)) {
        return res.sendFile(imagePath);
      } else {
        return res.sendFile(defaultProfilePath);
      }
    } catch (fsError) {
      return res.sendFile(defaultProfilePath);
    }
  } catch (error) {
    console.error('Error fetching user image:', error);
    const defaultProfilePath = path.join(__dirname, '../public/default-profile.png');
    res.sendFile(defaultProfilePath);
  }
});

module.exports = router;
