import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, List, ListOrdered, Heading1, Heading2, Heading3, X, ChevronDown, BookMarked, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Footer from '../components/Footer';
import Cookies from 'js-cookie';
import axios from 'axios';
import API_BASE_URL from '../config';

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Horror",
  "Adventure",
  "Historical Fiction",
  "Young Adult",
  "Children's",
  "Biography",
  "Self-help",
  "Poetry",
  "Drama",
  "Comedy",
  "Non-fiction",
  "Other"
];

const WriteBookPage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', message: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const customerId = Cookies.get('customerId');
    const authorId = Cookies.get('authorId');
    setIsLoggedIn(!!customerId || !!authorId);
  }, []);
  
  // Handle text formatting
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };
  
  // Handle save functionality
  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    if (!bookTitle.trim()) {
      setSaveMessage({ type: 'error', message: 'Please enter a book title' });
      return;
    }
    
    if (!bookGenre) {
      setSaveMessage({ type: 'error', message: 'Please select a genre' });
      return;
    }
    
    if (!content.trim()) {
      setSaveMessage({ type: 'error', message: 'Book content cannot be empty' });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const authorId = Cookies.get('authorId');
      const customerId = Cookies.get('customerId');
      
      const userId = authorId || customerId;
      const userRole = authorId ? 'author' : 'customer';
      
      const bookData = {
        title: bookTitle,
        genre: bookGenre,
        description: bookDescription,
        content: content,
        userId: userId,
        userRole: userRole
      };
      
      // This is a placeholder for the actual API endpoint
      // You would need to implement this endpoint in your backend
      const response = await axios.post(`${API_BASE_URL}/api/books/create`, bookData);
      
      if (response.data.success) {
        setSaveMessage({ type: 'success', message: 'Book saved successfully!' });
        // Optionally redirect to the book view page
        // navigate(`/books/${response.data.bookId}`);
      } else {
        setSaveMessage({ type: 'error', message: response.data.message || 'Failed to save book' });
      }
    } catch (error) {
      console.error('Error saving book:', error);
      setSaveMessage({ 
        type: 'error', 
        message: error.response?.data?.message || 'An error occurred while saving your book'
      });
    } finally {
      setIsSaving(false);
      
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSaveMessage({ type: '', message: '' });
      }, 5000);
    }
  };
  
  // Auto-save functionality
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [draftId, setDraftId] = useState(localStorage.getItem('currentDraftId') || null);
  
  // Handle editor content change with debounce for auto-save
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      // Save to local storage for recovery
      localStorage.setItem('bookDraft', newContent);
      localStorage.setItem('bookTitle', bookTitle);
      localStorage.setItem('bookGenre', bookGenre);
      localStorage.setItem('bookDescription', bookDescription);
    }
  };
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isLoggedIn || !content.trim()) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        if (bookTitle.trim()) {
          setIsSaving(true);
          setSaveMessage({ type: 'info', message: 'Auto-saving...' });
          
          const authorId = Cookies.get('authorId');
          const customerId = Cookies.get('customerId');
          
          const userId = authorId || customerId;
          const userRole = authorId ? 'author' : 'customer';
          
          const bookData = {
            title: bookTitle,
            genre: bookGenre || 'Draft',
            description: bookDescription,
            content: content,
            userId: userId,
            userRole: userRole,
            isDraft: true,
            draftId: draftId
          };
          
          // Use the create endpoint for new drafts, or update for existing ones
          const endpoint = draftId 
            ? `${API_BASE_URL}/api/books/update-draft/${draftId}` 
            : `${API_BASE_URL}/api/books/create-draft`;
          
          const response = await axios.post(endpoint, bookData);
          
          if (response.data.success) {
            setLastSaved(new Date());
            setSaveMessage({ type: 'success', message: 'Draft auto-saved' });
            
            // If this is a new draft, store the ID
            if (!draftId && response.data.draftId) {
              setDraftId(response.data.draftId);
              localStorage.setItem('currentDraftId', response.data.draftId);
            }
            
            // Clear the message after 3 seconds
            setTimeout(() => {
              setSaveMessage({ type: '', message: '' });
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveMessage({ 
          type: 'error', 
          message: 'Auto-save failed. Your work is saved locally.'
        });
      } finally {
        setIsSaving(false);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearTimeout(autoSaveTimer);
  }, [content, bookTitle, bookGenre, bookDescription, isLoggedIn, autoSaveEnabled, draftId]);
  
  // Load draft from local storage
  // Load draft from server or local storage
  useEffect(() => {
    const loadDraft = async () => {
      const draftId = localStorage.getItem('currentDraftId');
      
      if (draftId && isLoggedIn) {
        try {
          setSaveMessage({ type: 'info', message: 'Loading your draft...' });
          const response = await axios.get(`${API_BASE_URL}/api/books/draft/${draftId}`, {
            withCredentials: true
          });
          
          if (response.data.success) {
            const { draft } = response.data;
            
            setBookTitle(draft.title);
            setBookGenre(draft.genre);
            setBookDescription(draft.description);
            
            if (editorRef.current && draft.content) {
              editorRef.current.innerHTML = draft.content;
              setContent(draft.content);
            }
            
            setSaveMessage({ type: 'success', message: 'Draft loaded successfully' });
            setTimeout(() => setSaveMessage({ type: '', message: '' }), 3000);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          setSaveMessage({ 
            type: 'error', 
            message: 'Could not load your draft. Loading from local storage instead.'
          });
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedContent = localStorage.getItem('bookDraft');
      const savedTitle = localStorage.getItem('bookTitle');
      const savedGenre = localStorage.getItem('bookGenre');
      const savedDescription = localStorage.getItem('bookDescription');
      
      if (savedContent && editorRef.current) {
        editorRef.current.innerHTML = savedContent;
        setContent(savedContent);
      }
      
      if (savedTitle) setBookTitle(savedTitle);
      if (savedGenre) setBookGenre(savedGenre);
      if (savedDescription) setBookDescription(savedDescription);
    };
    
    loadDraft();
  }, [isLoggedIn]);
  
  // Login modal component
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Login Required</h2>
          <button 
            onClick={() => setShowLoginModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to be logged in to save your book. Please login or create an account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/login" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md font-medium flex-1 text-center"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium flex-1 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-yellow-500 dark:bg-gray-800 text-yellow-900 dark:text-yellow-200 p-4 shadow-md sticky top-0 z-40 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-black dark:text-yellow-300" />
            <h1 className="text-2xl font-bold dark:text-yellow-300">Novelistan</h1>
          </Link>
          
          <div className="flex space-x-6 items-center">
            <Link to="/" className="hover:text-yellow-800 dark:hover:text-yellow-200">Home</Link>
            <Link to="/about" className="hover:text-yellow-800 dark:hover:text-yellow-200">About</Link>
            <Link to="/contact" className="hover:text-yellow-800 dark:hover:text-yellow-200">Contact</Link>
            {isLoggedIn ? (
              <Link to="/CustomerHandling" className="bg-black text-yellow-500 px-4 py-2 rounded-md hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-black text-yellow-500 px-4 py-2 rounded-md hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Book Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <BookMarked className="mr-2 h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              Book Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Book Title
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Enter your book title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="relative">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Genre
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                    className="w-full px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 dark:text-white flex justify-between items-center"
                  >
                    {bookGenre || "Select a genre"}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showGenreDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {GENRES.map((genre) => (
                        <div
                          key={genre}
                          className="px-4 py-2 hover:bg-yellow-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white"
                          onClick={() => {
                            setBookGenre(genre);
                            setShowGenreDropdown(false);
                          }}
                        >
                          {genre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Book Description
                </label>
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Write a short description of your book"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Editor Toolbar */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-2 flex flex-wrap gap-1 border-b border-gray-300 dark:border-gray-600">
            <button 
              onClick={() => formatText('bold')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('italic')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('underline')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Underline"
            >
              <Underline className="h-5 w-5" />
            </button>
            
            <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-500"></div>
            
            <button 
              onClick={() => formatText('justifyLeft')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Align Left"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('justifyCenter')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Align Center"
            >
              <AlignCenter className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('justifyRight')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Align Right"
            >
              <AlignRight className="h-5 w-5" />
            </button>
            
            <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-500"></div>
            
            <button 
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Bullet List"
            >
              <List className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('insertOrderedList')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Numbered List"
            >
              <ListOrdered className="h-5 w-5" />
            </button>
            
            <div className="h-6 mx-1 w-px bg-gray-300 dark:bg-gray-500"></div>
            
            <button 
              onClick={() => formatText('formatBlock', '<h1>')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Heading 1"
            >
              <Heading1 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('formatBlock', '<h2>')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Heading 2"
            >
              <Heading2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => formatText('formatBlock', '<h3>')}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              title="Heading 3"
            >
              <Heading3 className="h-5 w-5" />
            </button>
            
            <div className="ml-auto flex items-center gap-3">
              {/* Auto-save toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto-save</span>
                <div 
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 cursor-pointer ${autoSaveEnabled ? 'bg-yellow-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </div>
              </div>
              
              {/* Last saved indicator */}
              {lastSaved && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              <button 
                onClick={() => navigate('/my-drafts')}
                className="flex items-center px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
              >
                <FileText className="h-5 w-5 mr-1" />
                My Drafts
              </button>
              
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Save className="h-5 w-5 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          
          {/* Rich Text Editor */}
          <div 
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="min-h-[500px] p-6 bg-white dark:bg-gray-800 rounded-b-lg shadow-md outline-none text-gray-800 dark:text-gray-200 overflow-auto"
            style={{ lineHeight: '1.6' }}
          ></div>
          
          {/* Save Message */}
          {saveMessage.message && (
            <div className={`mt-4 p-3 rounded-md ${
              saveMessage.type === 'success' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {saveMessage.message}
            </div>
          )}
        </div>
      </div>
      
      {/* Login Modal */}
      {showLoginModal && <LoginModal />}
      
      <Footer />
    </div>
  );
};

export default WriteBookPage;
