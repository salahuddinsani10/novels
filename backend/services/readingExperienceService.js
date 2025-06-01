const { GoogleGenerativeAI } = require('@google/generative-ai');
const UserPreference = require('../models/UserPreference');
const Book = require('../models/Book');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Initialize Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "AIzaSyBIPrq3d3OtwFrGLKFaY1MhmyoXa6tYgAQ");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 16,
    maxOutputTokens: 1500,
  },
});

/**
 * Get or create user preferences
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User preferences
 */
async function getUserPreferences(userId) {
  try {
    let userPreference = await UserPreference.findOne({ user: userId });
    
    if (!userPreference) {
      // Create default preferences if not found
      userPreference = new UserPreference({
        user: userId,
        favoriteGenres: [],
        readingLevel: 'intermediate',
        readingTimePerDay: 30,
        moodPreferences: [],
        readingHistory: []
      });
      
      await userPreference.save();
    }
    
    return userPreference;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw new Error('Failed to get user preferences');
  }
}

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - New preferences to update
 * @returns {Promise<Object>} - Updated user preferences
 */
async function updateUserPreferences(userId, preferences) {
  try {
    const userPreference = await UserPreference.findOneAndUpdate(
      { user: userId },
      { $set: preferences },
      { new: true, upsert: true, runValidators: true }
    );
    
    return userPreference;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update user preferences');
  }
}

/**
 * Update reading history for a user
 * @param {string} userId - User ID
 * @param {string} bookId - Book ID
 * @param {number} progress - Reading progress (percentage)
 * @returns {Promise<Object>} - Updated user preferences
 */
async function updateReadingProgress(userId, bookId, progress) {
  try {
    // Get user preferences
    const userPreference = await getUserPreferences(userId);
    
    // Find book in reading history
    const bookIndex = userPreference.readingHistory.findIndex(
      (item) => item.book.toString() === bookId
    );
    
    if (bookIndex !== -1) {
      // Update existing record
      userPreference.readingHistory[bookIndex].progress = progress;
      userPreference.readingHistory[bookIndex].lastRead = new Date();
    } else {
      // Add new book to reading history
      userPreference.readingHistory.push({
        book: bookId,
        progress: progress,
        lastRead: new Date()
      });
    }
    
    await userPreference.save();
    return userPreference;
  } catch (error) {
    console.error('Error updating reading progress:', error);
    throw new Error('Failed to update reading progress');
  }
}

/**
 * Generate personalized reading plan
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Personalized reading plan
 */
async function generateReadingPlan(userId) {
  try {
    // Get user preferences and reading history
    const userPreference = await UserPreference.findOne({ user: userId })
      .populate({
        path: 'readingHistory.book',
        select: 'name genre'
      });
    
    if (!userPreference) {
      throw new Error('User preferences not found');
    }
    
    // Get books in progress
    const booksInProgress = userPreference.readingHistory
      .filter(item => item.progress > 0 && item.progress < 100)
      .map(item => ({
        id: item.book._id,
        name: item.book.name,
        genre: item.book.genre,
        progress: item.progress,
        lastRead: item.lastRead
      }));
    
    // Get favorite genres
    const favoriteGenres = userPreference.favoriteGenres;
    
    // Get reading level and time
    const readingLevel = userPreference.readingLevel;
    const readingTime = userPreference.readingTimePerDay;
    
    // Create the prompt for the reading plan
    const prompt = `Create a personalized reading plan for a user with the following preferences:

Reading Level: ${readingLevel}
Available Reading Time: ${readingTime} minutes per day
Favorite Genres: ${favoriteGenres.join(', ') || 'Not specified'}

Books Currently in Progress:
${booksInProgress.map(book => 
  `- ${book.name} (${book.genre}) - ${book.progress}% complete, last read on ${new Date(book.lastRead).toLocaleDateString()}`
).join('\n')}

Please provide:
1. A weekly reading schedule considering the user's available time
2. Recommendations for which books to prioritize
3. Estimated completion dates for books in progress
4. Suggestions for maintaining a consistent reading habit
5. Tips for maximizing comprehension based on the user's reading level

The plan should be practical, encouraging, and tailored to the user's specific situation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      plan: response.text(),
      userPreferences: {
        readingLevel,
        readingTime,
        favoriteGenres
      },
      currentBooks: booksInProgress
    };
  } catch (error) {
    console.error('Error generating reading plan:', error);
    throw new Error('Failed to generate reading plan');
  }
}

/**
 * Generate mood-based book recommendations
 * @param {string} userId - User ID
 * @param {string} mood - Current mood (e.g., 'adventurous', 'relaxed')
 * @returns {Promise<Object>} - Mood-based book recommendations
 */
async function getMoodBasedRecommendations(userId, mood) {
  try {
    // Get user preferences
    const userPreference = await getUserPreferences(userId);
    
    // Get all books
    const books = await Book.find().populate('author', 'name');
    
    // Format book data for the prompt
    const bookData = books.map(book => ({
      id: book._id,
      title: book.name,
      genre: book.genre,
      author: book.author ? book.author.name : 'Unknown'
    }));
    
    // Create the prompt for mood-based recommendations
    const prompt = `Based on a user who is currently feeling "${mood}", recommend 5 books from the following list that would best match this mood.

Available Books:
${bookData.map(book => `- "${book.title}" by ${book.author} (${book.genre})`).join('\n')}

User's Favorite Genres: ${userPreference.favoriteGenres.join(', ') || 'Not specified'}
User's Reading Level: ${userPreference.readingLevel}

For each recommendation, explain in 2-3 sentences why this book would be perfect for the user's current mood. Focus on emotional resonance, themes, and reading experience rather than just plot. Consider the user's favorite genres but don't limit recommendations strictly to those genres.

Format your response as follows:
1. [Book Title] by [Author]
   Why: [Your explanation]

2. [Book Title] by [Author]
   Why: [Your explanation]

And so on.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      mood,
      recommendations: response.text(),
      userPreferences: {
        favoriteGenres: userPreference.favoriteGenres,
        readingLevel: userPreference.readingLevel
      }
    };
  } catch (error) {
    console.error('Error generating mood-based recommendations:', error);
    throw new Error('Failed to generate mood-based recommendations');
  }
}

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  updateReadingProgress,
  generateReadingPlan,
  getMoodBasedRecommendations
};
