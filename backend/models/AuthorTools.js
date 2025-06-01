const mongoose = require('mongoose');

const authorToolSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  toolType: {
    type: String,
    enum: ['coverSuggestion', 'writingFeedback', 'plotDevelopment'],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

const AuthorTool = mongoose.model('AuthorTool', authorToolSchema);

module.exports = AuthorTool;
