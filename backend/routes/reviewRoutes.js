const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// PUBLIC VERSION FOR CUSTOMER REVIEWS - no token validation required
// This version is for customers who already have their customerId from cookies
router.post('/public', async (req, res) => {
  console.log('PUBLIC REVIEW ENDPOINT ACCESSED');
  console.log('Request body:', req.body);
  try {
    const { bookId, customerId, rating, comment } = req.body;
    
    // Validate required parameters
    if (!bookId || !customerId || !rating) {
      return res.status(400).json({ message: 'Missing required fields: bookId, customerId, and rating are required' });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if customer has already reviewed this book
    const existingReview = await Review.findOne({
      book: bookId,
      customer: customerId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    // Create the review with customer ID from request body
    const review = new Review({
      book: bookId,
      customer: customerId,
      rating,
      comment
    });

    await review.save();

    // Update book's average rating
    await Review.getAverageRating(bookId);

    res.status(201).json({ 
      message: 'Review added successfully',
      review: review 
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Add a review (Original version with token validation)
// This version is the original with token validation
router.post('/', auth(['customer']), async (req, res) => {
  console.log('Review POST request user:', req.user);
  console.log('Request body:', req.body);
  try {
    const { bookId, rating, comment } = req.body;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Log the entire request body for debugging
    console.log('Full request body:', req.body);
    console.log('Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Get customer ID from request.body (explicitly sent) or req.user (from auth)
    let customerId = null;

    // First priority: use customerId from request body
    if (req.body.customerId) {
      customerId = req.body.customerId;
      console.log('Using customerId from request body:', customerId);
    } 
    // Second priority: use user ID from token
    else if (req.user && req.user._id) {
      customerId = req.user._id;
      console.log('Using customerId from auth token:', customerId);
    }
    
    // Special case for testing - if neither source works but we're in development,
    // allow review creation with the customerId directly from request body
    if (!customerId && process.env.NODE_ENV !== 'production') {
      console.log('Development mode: Allowing review creation with explicit customerId');
      customerId = req.body.customerId;
    }

    // Final check that we have a customer ID
    if (!customerId) {
      return res.status(401).json({ 
        message: 'Customer not identified. Please log in again.',
        details: 'No valid customer ID found in request body or authentication token' 
      });
    }
    
    // Check if customer has already reviewed this book
    const existingReview = await Review.findOne({
      book: bookId,
      customer: customerId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create new review with enhanced debugging
    console.log('Creating review with:');
    console.log('- Book ID:', bookId);
    console.log('- User object:', req.user ? req.user : 'No user in request');
    console.log('- Final customer ID being used for review:', customerId);
    
    const review = new Review({
      book: bookId,
      customer: customerId,
      rating,
      comment
    });

    await review.save();

    // Update book's average rating
    await Review.getAverageRating(bookId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Get reviews for a book (public route - no auth required)
// IMPORTANT: This route has been marked as public and requires NO authentication
router.get('/book/:bookId', async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    // Validate bookId
    if (!bookId) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    const reviews = await Review.find({ book: bookId })
      .populate('customer', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    // If no reviews found, return empty array instead of error
    if (reviews.length === 0) {
      return res.status(200).json([]);
    }

    res.json(reviews);
  } catch (error) {
    console.error('Review fetch error:', {
      bookId: req.params.bookId,
      errorMessage: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching reviews', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
    });
  }
});

// Get reviews by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('book', 'name coverImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews', error: error.message });
  }
});

// Get review by book ID (for the current user)
router.get('/reviewByBookID', async (req, res) => {
  try {
    const { id } = req.query;
    
    const review = await Review.findOne({
      book: id,
      user: req.user._id
    }).populate('user', 'name');

    if (!review) {
      return res.status(204).end(); // No content
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

// Update a review (User only)
router.put('/:id', auth(['customer']), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { rating, comment },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Update book's average rating
    await Review.getAverageRating(review.book);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review (User only)
router.delete('/:id', auth(['customer']), async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Update book's average rating
    await Review.getAverageRating(review.book);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;
