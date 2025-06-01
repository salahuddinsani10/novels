const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favoriteGenres: [{
    type: String
  }],
  readingLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  readingTimePerDay: {
    type: Number, // in minutes
    default: 30
  },
  moodPreferences: [{
    type: String, // e.g., 'adventure', 'relaxing', 'educational', 'inspirational'
  }],
  readingHistory: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    progress: {
      type: Number, // percentage of book completed
      default: 0
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference;
