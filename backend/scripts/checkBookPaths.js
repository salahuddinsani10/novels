const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelistanDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Get the Book model
const Book = require('../models/Book');

// Find a book and print its file paths
async function checkBookPaths() {
  try {
    const books = await Book.find().limit(3);
    
    if (books.length === 0) {
      console.log('No books found in the database');
      return;
    }
    
    books.forEach((book, index) => {
      console.log(`\nBook ${index + 1}: ${book.name}`);
      console.log(`Book ID: ${book._id}`);
      console.log(`Book File Path: ${book.bookFile}`);
      console.log(`Cover Image Path: ${book.coverImage}`);
      
      // Check if the paths are Azure URLs
      const isBookAzure = book.bookFile && book.bookFile.includes('azure');
      const isCoverAzure = book.coverImage && book.coverImage.includes('azure');
      
      console.log(`Book file is Azure URL: ${isBookAzure}`);
      console.log(`Cover image is Azure URL: ${isCoverAzure}`);
    });
  } catch (error) {
    console.error('Error checking book paths:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the check
checkBookPaths();
