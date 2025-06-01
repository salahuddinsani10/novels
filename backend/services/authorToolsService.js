const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const AuthorTool = require('../models/AuthorTools');
const pdf = require('pdf-parse');
const path = require('path');

// Initialize Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "AIzaSyBIPrq3d3OtwFrGLKFaY1MhmyoXa6tYgAQ");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7, // Higher temperature for creative tasks
    topP: 0.9,
    topK: 32,
    maxOutputTokens: 2000,
  },
});

/**
 * Generate book cover suggestions based on book information
 * @param {Object} bookInfo - Information about the book
 * @returns {Promise<string>} - Cover design suggestions
 */
async function generateCoverSuggestions(bookInfo) {
  try {
    const prompt = `As a professional book cover designer, provide 3 creative and detailed book cover design ideas for the following book:
    
Title: ${bookInfo.name}
Genre: ${bookInfo.genre}
Description: ${bookInfo.description || 'A compelling story that engages readers from start to finish.'}

For each design idea, provide:
1. A concept description
2. Suggested color palette
3. Key visual elements
4. Typography recommendations
5. Overall mood/atmosphere

Make each design distinct and tailored to the genre and title.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating cover suggestions:', error);
    throw new Error('Failed to generate cover suggestions');
  }
}

/**
 * Analyze writing style and provide feedback
 * @param {string} filePath - Path to the book PDF file
 * @returns {Promise<string>} - Writing style analysis
 */
async function analyzeWritingStyle(filePath) {
  try {
    // Extract text from PDF
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    // Truncate text if too long
    const textContent = data.text;
    const truncatedText = textContent.length > 15000 
      ? textContent.substring(0, 15000) + '... [truncated]' 
      : textContent;

    const prompt = `As a professional editor and writing coach, analyze the following excerpt from a book manuscript. Provide constructive feedback on:

1. Writing style (clarity, flow, voice)
2. Strengths in the writing
3. Areas for improvement
4. Specific suggestions to enhance the prose
5. Overall impression

Be specific, supportive, and practical in your feedback.

Book Content:
${truncatedText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing writing style:', error);
    throw new Error('Failed to analyze writing style');
  }
}

/**
 * Generate plot development suggestions
 * @param {Object} plotInfo - Information about the current plot
 * @returns {Promise<string>} - Plot development suggestions
 */
async function generatePlotSuggestions(plotInfo) {
  try {
    const prompt = `As a professional story consultant and narrative expert, provide detailed plot development suggestions for the following story scenario:
    
Current Plot: ${plotInfo.currentPlot}
Genre: ${plotInfo.genre}
Main Characters: ${plotInfo.characters || 'The main protagonist and supporting characters'}
Current Challenges: ${plotInfo.challenges || 'Obstacles that the characters are facing'}

Provide suggestions for:
1. Plot structure improvements
2. Character development opportunities
3. Potential plot twists
4. Strengthening the narrative arc
5. Enhancing themes and motifs

Make your suggestions specific, creative, and aligned with the genre conventions while offering a fresh perspective.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating plot suggestions:', error);
    throw new Error('Failed to generate plot suggestions');
  }
}

/**
 * Save author tool result to database
 * @param {Object} toolData - Tool usage data to save
 * @returns {Promise<Object>} - Saved tool result record
 */
async function saveToolResult(toolData) {
  try {
    const authorTool = new AuthorTool(toolData);
    await authorTool.save();
    return authorTool;
  } catch (error) {
    console.error('Error saving tool result:', error);
    throw new Error('Failed to save tool result');
  }
}

/**
 * Get all author tool results for a specific author
 * @param {string} authorId - Author's user ID
 * @returns {Promise<Array>} - Author's tool usage history
 */
async function getAuthorToolResults(authorId) {
  try {
    return await AuthorTool.find({ author: authorId })
      .populate('book', 'name genre')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching author tool results:', error);
    throw new Error('Failed to fetch author tool results');
  }
}

/**
 * Analyze writing style from directly provided text content
 * @param {string} textContent - The text content to analyze
 * @returns {Promise<string>} - Writing style analysis
 */
async function analyzeWritingStyleFromText(textContent) {
  try {
    // Truncate text if too long
    const truncatedText = textContent.length > 15000 
      ? textContent.substring(0, 15000) + '... [truncated]' 
      : textContent;

    const prompt = `As a professional editor and writing coach, analyze the following excerpt. Provide constructive feedback on:

1. Writing style (clarity, flow, voice)
2. Strengths in the writing
3. Areas for improvement
4. Specific suggestions to enhance the prose
5. Overall impression

Be specific, supportive, and practical in your feedback.

Content:
${truncatedText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing writing style from text:', error);
    throw new Error('Failed to analyze writing style');
  }
}

module.exports = {
  generateCoverSuggestions,
  analyzeWritingStyle,
  analyzeWritingStyleFromText,
  generatePlotSuggestions,
  saveToolResult,
  getAuthorToolResults
};
