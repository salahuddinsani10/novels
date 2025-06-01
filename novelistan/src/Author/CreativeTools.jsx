import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, Edit, Layout } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';

// Define API base URL
import API_BASE_URL from '../config';

const CreativeTools = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cover');
  const [results, setResults] = useState('');
  const [error, setError] = useState('');
  const authorId = Cookies.get('authorId');
  
  // Form inputs
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [currentPlot, setCurrentPlot] = useState('');
  const [characters, setCharacters] = useState('');
  const [challenges, setChallenges] = useState('');
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        console.log('Using token:', token ? 'Present' : 'None');
        
        const response = await axios.get(`${API_BASE_URL}/api/book/${bookId}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        setBook(response.data);
        setTitle(response.data.name || '');
        setGenre(response.data.genre || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to fetch book details');
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    } else {
      // Not using a specific book, clear any loading state
      setLoading(false);
    }
  }, [bookId]);

  const handleCoverSuggestions = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setResults('');
      const token = Cookies.get('token');
      console.log('Using token for cover suggestions:', token ? 'Present' : 'None');
      
      const response = await axios.post(`${API_BASE_URL}/api/author-tools/cover-suggestions`, {
        bookId: bookId || null,
        description,
        title,
        genre
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setResults(response.data.suggestions);
      setLoading(false);
    } catch (err) {
      console.error('Cover suggestion error:', err);
      setError(err.response?.data?.message || 'Failed to generate cover suggestions');
      setLoading(false);
    }
  };

  const handleWritingAnalysis = async () => {
    try {
      setLoading(true);
      setResults('');
      const token = Cookies.get('token');
      console.log('Using token for writing analysis:', token ? 'Present' : 'None');
      
      const response = await axios.post(`${API_BASE_URL}/api/author-tools/writing-analysis`, {
        bookId: bookId || null,
        textContent: textContent || null
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setResults(response.data.analysis);
      setLoading(false);
    } catch (err) {
      console.error('Writing analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze writing style');
      setLoading(false);
    }
  };

  const handlePlotSuggestions = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setResults('');
      const token = Cookies.get('token');
      console.log('Using token for plot suggestions:', token ? 'Present' : 'None');
      
      const response = await axios.post(`${API_BASE_URL}/api/author-tools/plot-suggestions`, {
        bookId: bookId || null,
        currentPlot,
        characters,
        challenges,
        genre
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setResults(response.data.suggestions);
      setLoading(false);
    } catch (err) {
      console.error('Plot suggestions error:', err);
      setError(err.response?.data?.message || 'Failed to generate plot suggestions');
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cover':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Book Cover Design Suggestions</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Get AI-generated creative ideas for your book cover based on your book's details and description.
            </p>
            <form onSubmit={handleCoverSuggestions}>
              {!bookId && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Book Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter the title of your book"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="Fiction, Fantasy, Mystery, etc."
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about your book's theme, setting, or main characters..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Cover Suggestions'}
              </button>
            </form>
          </div>
        );
      
      case 'writing':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Writing Style Analysis</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Get professional feedback on your writing style, strengths, and areas for improvement.
            </p>
            
            {!bookId && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Enter Text to Analyze</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                  rows="6"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste a sample of your writing here (at least 500 words recommended)"
                ></textarea>
              </div>
            )}
            
            {bookId ? (
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                This tool will analyze the content of your book and provide constructive feedback on your writing style.
              </p>
            ) : (
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                This tool will analyze the text you provide and offer constructive feedback on your writing style.
              </p>
            )}
            
            <button
              onClick={handleWritingAnalysis}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              disabled={loading || (!bookId && !textContent)}
            >
              {loading ? 'Analyzing...' : 'Analyze Writing Style'}
            </button>
          </div>
        );
      
      case 'plot':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Plot Development Suggestions</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Get creative suggestions to enhance your plot, character development, and narrative arc.
            </p>
            <form onSubmit={handlePlotSuggestions}>
              {!bookId && (
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Fiction, Fantasy, Mystery, etc."
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Current Plot</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                  rows="3"
                  value={currentPlot}
                  onChange={(e) => setCurrentPlot(e.target.value)}
                  placeholder="Describe your current plot..."
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Main Characters (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                  rows="2"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="List your main characters and their roles..."
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Current Challenges (optional)</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                  rows="2"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="Describe any plot challenges or roadblocks you're facing..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Plot Suggestions'}
              </button>
            </form>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && !results) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Creative Tools for Authors
          {book && ` - ${book.name}`}
        </h2>
        <div className="flex gap-2">
          {bookId && (
            <button
              onClick={() => navigate('/author/creative-tools')}
              className="px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300"
            >
              Use Without Book
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-secondary-600 transition-colors duration-300"
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">AI Tools</h3>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setActiveTab('cover')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'cover'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Layout className="mr-2" size={16} />
                  Cover Design
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveTab('writing')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'writing'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Edit className="mr-2" size={16} />
                  Writing Feedback
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('plot')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'plot'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Book className="mr-2" size={16} />
                  Plot Development
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-3">
          {renderTabContent()}

          {results && (
            <div className="mt-6 bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">AI Results</h3>
              <div className="bg-gray-50 dark:bg-secondary-900 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {results}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTools;
