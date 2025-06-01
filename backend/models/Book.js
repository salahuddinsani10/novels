const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  bookFile: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  }
}, { timestamps: true });

bookSchema.index({ name: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);
