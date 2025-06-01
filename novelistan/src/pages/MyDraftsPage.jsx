import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Book, Edit, Trash2, Plus, Clock, Calendar } from 'lucide-react';
import API_BASE_URL from '../config';
import SharedHeader from '../components/SharedHeader';
import Footer from '../components/Footer';

const MyDraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  // Check login status
  useEffect(() => {
    const authorId = Cookies.get('authorId');
    const customerId = Cookies.get('customerId');
    setIsLoggedIn(!!authorId || !!customerId);
    
    if (!authorId && !customerId) {
      setShowLoginModal(true);
    } else {
      fetchDrafts();
    }
  }, []);

  // Fetch user drafts
  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/books/user-drafts`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setDrafts(response.data.drafts);
      } else {
        setError('Failed to load drafts');
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setError(error.response?.data?.message || 'An error occurred while fetching your drafts');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle continue writing
  const handleContinueWriting = (draftId) => {
    localStorage.setItem('currentDraftId', draftId);
    navigate('/write-book');
  };

  // Handle delete draft
  const handleDeleteDraft = async (draftId) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/books/${draftId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setDrafts(drafts.filter(draft => draft._id !== draftId));
      } else {
        alert('Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert(error.response?.data?.message || 'An error occurred while deleting the draft');
    }
  };

  // Login modal component
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to be logged in to view your drafts.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex-1"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex-1"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 font-sans">
      <SharedHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Drafts</h1>
            <button
              onClick={() => navigate('/write-book')}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Book
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your drafts...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <Book className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
              <h2 className="text-xl font-semibold mt-4 text-gray-700 dark:text-gray-300">No drafts yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                Start writing your first book by clicking the "New Book" button above.
              </p>
              <button
                onClick={() => navigate('/write-book')}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Start Writing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map(draft => (
                <div key={draft._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 truncate">
                      {draft.name}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="inline-flex items-center mr-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(draft.createdAt)}
                      </span>
                      <span className="inline-flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Last edited: {formatDate(draft.updatedAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {draft.description || 'No description'}
                    </p>
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleContinueWriting(draft._id)}
                        className="flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Continue
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft._id)}
                        className="flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {showLoginModal && <LoginModal />}
    </div>
  );
};

export default MyDraftsPage;
