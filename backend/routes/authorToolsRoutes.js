const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const { 
  generateCoverSuggestions, 
  analyzeWritingStyle, 
  generatePlotSuggestions,
  saveToolResult,
  getAuthorToolResults
} = require('../services/authorToolsService');

// Get all author tool results for the authenticated author
router.get('/history', auth(['author']), async (req, res) => {
  try {
    console.log('Author ID from request:', req.user._id);
    const results = await getAuthorToolResults(req.user._id);
    res.json(results);
  } catch (error) {
    console.error('Error in /history route:', error);
    res.status(500).json({ 
      message: 'Error fetching author tool results', 
      error: error.message 
    });
  }
});

// Generate book cover suggestions
router.post('/cover-suggestions', auth(['author']), async (req, res) => {
  try {
    const { bookId, description, title, genre } = req.body;
    let bookInfo = {};


    // If bookId is provided, get book details from database
    if (bookId) {
      const book = await Book.findOne({ 
        _id: bookId,
        author: req.user._id
      });

      if (book) {
        bookInfo = {
          name: book.name,
          genre: book.genre,
          description: description || ''
        };
      }
    } else {
      // If no bookId, use provided info directly
      bookInfo = {
        name: title || 'Untitled Book',
        genre: genre || 'General',
        description: description || 'A compelling story with interesting characters.'
      };
    }

    // Generate cover suggestions
    const suggestions = await generateCoverSuggestions(bookInfo);

    // Save the result
    await saveToolResult({
      author: req.user._id,
      book: bookId || null,
      toolType: 'coverSuggestion',
      prompt: JSON.stringify(bookInfo),
      result: suggestions
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Cover suggestions error:', error);
    res.status(500).json({ 
      message: 'Error generating cover suggestions', 
      error: error.message 
    });
  }
});

// Analyze writing style
router.post('/writing-analysis', auth(['author']), async (req, res) => {
  try {
    const { bookId, textContent } = req.body;
    
    // We need either a bookId or text content to analyze
    if (!bookId && !textContent) {
      return res.status(400).json({ message: 'Either Book ID or text content is required' });
    }

    let analysis;
    let promptText;
    let bookName = 'custom text';
    
    if (bookId) {
      // Get book details if bookId is provided
      const book = await Book.findOne({ 
        _id: bookId,
        author: req.user._id
      });

      if (!book) {
        return res.status(404).json({ message: 'Book not found or not authorized' });
      }

      // Analyze writing style using the book file
      analysis = await analyzeWritingStyle(book.bookFile);
      promptText = `Writing analysis for book: ${book.name}`;
      bookName = book.name;
    } else {
      // Analyze provided text content
      analysis = await analyzeWritingStyleFromText(textContent);
      promptText = 'Writing analysis for custom text';
    }

    // Save the result
    await saveToolResult({
      author: req.user._id,
      book: bookId || null,
      toolType: 'writingFeedback',
      prompt: promptText,
      result: analysis
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Writing analysis error:', error);
    res.status(500).json({ 
      message: 'Error analyzing writing style', 
      error: error.message 
    });
  }
});

// Generate plot development suggestions
router.post('/plot-suggestions', auth(['author']), async (req, res) => {
  try {
    const { bookId, currentPlot, characters, challenges, genre } = req.body;

    // Validate input
    if (!currentPlot) {
      return res.status(400).json({ message: 'Current plot is required' });
    }

    // Create plot info object
    let plotInfo = {
      currentPlot,
      characters: characters || '',
      challenges: challenges || ''
    };
    
    // Get genre from book if bookId provided, otherwise use direct input
    if (bookId) {
      const book = await Book.findOne({ 
        _id: bookId,
        author: req.user._id
      });

      if (book) {
        plotInfo.genre = book.genre;
      } else {
        plotInfo.genre = genre || 'Fiction';
      }
    } else {
      plotInfo.genre = genre || 'Fiction';
    }

    // Generate plot suggestions
    const suggestions = await generatePlotSuggestions(plotInfo);

    // Save the result
    await saveToolResult({
      author: req.user._id,
      book: bookId || null,
      toolType: 'plotDevelopment',
      prompt: JSON.stringify(plotInfo),
      result: suggestions
    });

    res.json({ suggestions });
  } catch (error) {
    console.error('Plot suggestions error:', error);
    res.status(500).json({ 
      message: 'Error generating plot suggestions', 
      error: error.message 
    });
  }
});

module.exports = router;
