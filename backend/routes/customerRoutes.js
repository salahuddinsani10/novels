const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { uploadUserProfile, processProfileUpload } = require('../middleware/upload');

const router = express.Router();

// Customer registration with profile image upload
router.post('/register', uploadUserProfile, processProfileUpload, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if customer already exists in either User or Customer models
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered as an author. Please use a different email.', 
        error: 'Duplicate email' 
      });
    }
    
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ 
        message: 'Email already registered. Please login or use a different email.', 
        error: 'Duplicate email' 
      });
    }
    
    // Get profile image from middleware (if any)
    const profileImage = req.file ? req.profileImageUrl : null;
    
    // Create new customer with hashed password (using pre-save hook in Customer model)
    const customer = new Customer({
      name,
      email,
      password,
      profileImage,
      registrationDate: new Date()
    });
    
    await customer.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: customer._id, role: 'customer' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Don't send password in response
    customer.password = undefined;
    
    res.status(201).json({ token, user: customer._id, role: 'customer' });
  } catch (error) {
    console.error('Customer registration error:', error);
    
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

// Define customer login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if customer exists
    let user = await Customer.findOne({ email });
    
    // If no user is found
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: 'customer' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Don't send password in response
    user.password = undefined;
    
    res.json({
      token,
      user: user._id,
      role: 'customer'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer image route
router.get('/customerImage/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const customer = await Customer.findById(userId).select('profileImage');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    if (!customer.profileImage) {
      return res.status(404).json({ message: 'Profile image not found' });
    }
    
    res.json({ profileImage: customer.profileImage });
  } catch (error) {
    console.error('Error retrieving customer image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
