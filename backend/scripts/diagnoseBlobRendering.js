/**
 * Diagnostic script to identify file rendering issues with Azure Blob Storage
 */
const mongoose = require('mongoose');
const https = require('https');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novelistanDB');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Load models
const Book = require('../models/Book');
const Customer = require('../models/Customer');
const Author = require('../models/Author');

async function checkFilePaths() {
  console.log('\n========== DIAGNOSTIC RESULTS ==========\n');
  
  // Check book files
  const books = await Book.find().limit(5);
  console.log(`Found ${books.length} books in database`);
  
  books.forEach((book, index) => {
    console.log(`\n----- Book ${index + 1}: ${book.name} -----`);
    console.log(`ID: ${book._id}`);
    console.log(`Book File: ${book.bookFile}`);
    console.log(`Cover Image: ${book.coverImage}`);
    console.log(`Is Book File Azure URL: ${book.bookFile?.startsWith('http')}`);
    console.log(`Is Cover Image Azure URL: ${book.coverImage?.startsWith('http')}`);
  });
  
  // Check profile images
  const customers = await Customer.find().limit(3);
  console.log(`\n\nFound ${customers.length} customers in database`);
  
  customers.forEach((customer, index) => {
    console.log(`\n----- Customer ${index + 1}: ${customer.name} -----`);
    console.log(`ID: ${customer._id}`);
    console.log(`Profile Picture: ${customer.profilePicture}`);
    console.log(`Is Profile Picture Azure URL: ${customer.profilePicture?.startsWith('http')}`);
  });
  
  const authors = await Author.find().limit(3);
  console.log(`\n\nFound ${authors.length} authors in database`);
  
  authors.forEach((author, index) => {
    console.log(`\n----- Author ${index + 1}: ${author.name} -----`);
    console.log(`ID: ${author._id}`);
    console.log(`Profile Picture: ${author.profilePicture}`);
    console.log(`Is Profile Picture Azure URL: ${author.profilePicture?.startsWith('http')}`);
  });
  
  // Test Azure connectivity
  console.log('\n\n----- Testing Azure Blob Storage Connectivity -----');
  const testUrl = 'https://novelistanupload.blob.core.windows.net/uploads/default-profile.png';
  console.log(`Testing access to: ${testUrl}`);
  
  await new Promise((resolve) => {
    const req = https.get(testUrl, (res) => {
      let data = [];
      console.log('Azure connectivity: SUCCESS');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Content Type: ${res.headers['content-type']}`);
      
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        console.log(`Content Length: ${buffer.length} bytes`);
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('Azure connectivity: FAILED');
      console.log(`Error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
  
  console.log('\n========== END DIAGNOSTIC RESULTS ==========\n');
}

// Run diagnostics
async function runDiagnostics() {
  await connectDB();
  await checkFilePaths();
  mongoose.disconnect();
}

runDiagnostics();
