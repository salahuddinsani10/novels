const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getUserPreferences,
  updateUserPreferences,
  updateReadingProgress,
  generateReadingPlan,
  getMoodBasedRecommendations
} = require('../services/readingExperienceService');

// Get user preferences
router.get('/preferences', auth(['customer', 'author']), async (req, res) => {
  try {
    const preferences = await getUserPreferences(req.user._id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user preferences', 
      error: error.message 
    });
  }
});

// Update user preferences
router.put('/preferences', auth(['customer', 'author']), async (req, res) => {
  try {
    const { favoriteGenres, readingLevel, readingTimePerDay, moodPreferences } = req.body;
    
    // Create preferences object with only provided fields
    const preferences = {};
    if (favoriteGenres) preferences.favoriteGenres = favoriteGenres;
    if (readingLevel) preferences.readingLevel = readingLevel;
    if (readingTimePerDay) preferences.readingTimePerDay = readingTimePerDay;
    if (moodPreferences) preferences.moodPreferences = moodPreferences;
    
    const updatedPreferences = await updateUserPreferences(req.user._id, preferences);
    res.json(updatedPreferences);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating user preferences', 
      error: error.message 
    });
  }
});

// Update reading progress
router.post('/progress', auth(['customer', 'author']), async (req, res) => {
  try {
    const { bookId, progress } = req.body;
    
    // Validate input
    if (!bookId || progress === undefined) {
      return res.status(400).json({ message: 'Book ID and progress are required' });
    }
    
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);
    
    const updatedPreferences = await updateReadingProgress(
      req.user._id, 
      bookId, 
      normalizedProgress
    );
    
    res.json(updatedPreferences);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating reading progress', 
      error: error.message 
    });
  }
});

// Generate personalized reading plan
router.get('/plan', auth(['customer', 'author']), async (req, res) => {
  try {
    const plan = await generateReadingPlan(req.user._id);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating reading plan', 
      error: error.message 
    });
  }
});

// Get mood-based book recommendations
router.get('/mood-recommendations', auth(['customer', 'author']), async (req, res) => {
  try {
    const { mood } = req.query;
    
    // Validate input
    if (!mood) {
      return res.status(400).json({ message: 'Mood parameter is required' });
    }
    
    const recommendations = await getMoodBasedRecommendations(req.user._id, mood);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating mood-based recommendations', 
      error: error.message 
    });
  }
});

module.exports = router;
