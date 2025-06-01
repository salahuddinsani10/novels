const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const axios = require('axios');
const path = require('path');
const os = require('os');

// Initialize Google Generative AI with the provided API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "AIzaSyBIPrq3d3OtwFrGLKFaY1MhmyoXa6tYgAQ");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.1,
    topP: 0.1,
    topK: 16,
    maxOutputTokens: 1000,
  },
});

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Path to the PDF file or Azure URL
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPdf(filePath) {
  try {
    let dataBuffer;
    
    // Check if the file path is an Azure URL
    if (filePath.startsWith('http')) {
      console.log(`Detected Azure URL: ${filePath}`);
      
      // Download the PDF from Azure
      const tempFilePath = path.join(os.tmpdir(), `temp-book-${Date.now()}.pdf`);
      
      try {
        const response = await axios.get(filePath, {
          responseType: 'arraybuffer'
        });
        
        // Save the file to a temporary location
        await fs.writeFile(tempFilePath, Buffer.from(response.data));
        console.log(`PDF downloaded to temporary file: ${tempFilePath}`);
        
        // Read the temporary file
        dataBuffer = await fs.readFile(tempFilePath);
        
        // Clean up the temporary file
        fs.unlink(tempFilePath).catch(err => {
          console.warn(`Warning: Could not delete temporary file ${tempFilePath}:`, err);
        });
      } catch (downloadError) {
        console.error('Error downloading PDF from Azure:', downloadError);
        throw new Error('Could not download PDF from Azure');
      }
    } else {
      // Local file path
      console.log(`Reading local PDF file: ${filePath}`);
      dataBuffer = await fs.readFile(filePath);
    }
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Could not process PDF for summary generation');
  }
}

/**
 * Generates a summary for the given text content using Gemini AI
 * @param {string} textContent - The text content to summarize
 * @returns {Promise<string>} - Generated summary
 */
async function generateSummary(textContent) {
  try {
    // Truncate text if too long to avoid hitting model token limits
    const truncatedText = textContent.length > 10000 
      ? textContent.substring(0, 10000) + '... [truncated]' 
      : textContent;

    const prompt = `Please provide a concise summary of the following book content. 
Focus on the main themes, key characters (if any), and the overall message or plot. 
Keep it under 300 words.

Book Content:
${truncatedText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate book summary');
  }
}

/**
 * Main function to generate a book summary from a PDF file
 * @param {string} filePath - Path to the book PDF file
 * @returns {Promise<string>} - Generated book summary
 */
async function generateBookSummary(filePath) {
  try {
    // Extract text from PDF
    const textContent = await extractTextFromPdf(filePath);
    
    if (!textContent || textContent.trim().length === 0) {
      // If no text could be extracted, use a fallback summary with the filename
      const filename = filePath.split(/[\\/]/).pop();
      return `
        This book appears to have complex character development and an engaging plot structure.
        The narrative explores themes of personal growth, relationships, and overcoming challenges.
        
        The story begins with an introduction to the main characters and their world, establishing
        the central conflict that will drive the plot forward. As the story progresses, the 
        characters face increasingly difficult challenges that test their resolve and force them
        to grow and change.
        
        By the end, the main conflicts are resolved in a satisfying way, though some elements
        remain open-ended, suggesting possibilities for future developments.
        
        This summary was generated for file: ${filename}
        (Note: This is a fallback summary because text extraction was not successful.)
      `;
    }

    // Generate and return the AI-based summary
    return await generateSummary(textContent);
  } catch (error) {
    console.error('Error in generateBookSummary:', error);
    throw error;
  }
}

module.exports = {
  generateBookSummary
};
