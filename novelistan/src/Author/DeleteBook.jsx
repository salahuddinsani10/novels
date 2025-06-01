// components/DeleteBook.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Trash2, BookOpen, Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import API_BASE_URL from '../config';

const DeleteBook = () => {
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookImages, setBookImages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchAuthorBooks();
    return () => {
      Object.values(bookImages).forEach((url) => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    // Load images for all books
    books.forEach(book => {
      if (book._id && !bookImages[book._id]) {
        fetchBookImage(book._id);
      }
    });
  }, [books]);

  const fetchAuthorBooks = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const authorId = Cookies.get('authorId');

      if (!token || !authorId) {
        throw new Error('Authentication token or author ID is missing. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/book/authorBook/${authorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized access. Please log in again.');
        }
        throw new Error(`Failed to fetch books. Status: ${response.status}`);
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookImage = async (bookId) => {
    try {
      if (!bookId) return;
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/cover/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBookImages(prev => ({ ...prev, [bookId]: imageUrl }));
    } catch (err) {
      console.error(`Image error for book ${bookId}:`, err);
      setBookImages(prev => ({ ...prev, [bookId]: null }));
    }
  };

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBook?._id) return;

    try {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/${selectedBook._id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete book');

      if (bookImages[selectedBook._id]?.startsWith('blob:')) {
        URL.revokeObjectURL(bookImages[selectedBook._id]);
      }

      setBooks(books.filter(book => book._id !== selectedBook._id));
      setBookImages(prev => {
        const newImages = { ...prev };
        delete newImages[selectedBook._id];
        return newImages;
      });
      setShowConfirmModal(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  const handleViewPdf = async (bookId) => {
    try {
      if (!bookId) {
        setError('Book ID is missing');
        return;
      }
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/pdf/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      console.error('PDF error:', err);
      setError('Failed to open PDF');
    }
  };

  const handleSort = (key) => {
    setSortOrder(sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(key);
  };

  const filteredAndSortedBooks = books
    .filter(book => {
      const searchLower = searchQuery.toLowerCase();
      return (
        book.name.toLowerCase().includes(searchLower) ||
        book.genre.toLowerCase().includes(searchLower) ||
        book.isbn.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      // Handle numeric values
      if (sortBy === 'publishYear') {
        valA = parseInt(valA) || 0;
        valB = parseInt(valB) || 0;
      } else {
        valA = valA?.toLowerCase() || '';
        valB = valB?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500 dark:border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-yellow-800 dark:text-yellow-300">Delete Book</h1>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 rounded text-sm" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 p-2 border border-yellow-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200 text-sm"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${sortBy === 'name' ? 
              'bg-yellow-500 dark:bg-yellow-600 text-white' : 
              'bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600'}`}
          >
            Name
            {sortBy === 'name' && (
              sortOrder === 'asc' ? 
                <ArrowUp className="h-3 w-3" /> : 
                <ArrowDown className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('genre')}
            className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${sortBy === 'genre' ? 
              'bg-yellow-500 dark:bg-yellow-600 text-white' : 
              'bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600'}`}
          >
            Genre
            {sortBy === 'genre' && (
              sortOrder === 'asc' ? 
                <ArrowUp className="h-3 w-3" /> : 
                <ArrowDown className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('publishYear')}
            className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1 ${sortBy === 'publishYear' ? 
              'bg-yellow-500 dark:bg-yellow-600 text-white' : 
              'bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600'}`}
          >
            Year
            {sortBy === 'publishYear' && (
              sortOrder === 'asc' ? 
                <ArrowUp className="h-3 w-3" /> : 
                <ArrowDown className="h-3 w-3" />
            )}
          </button>
        </div>

        {/* Results */}
        {!error && filteredAndSortedBooks.length === 0 ? (
          <p className="text-center text-yellow-800 dark:text-yellow-300 my-8">No books found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedBooks.map((book) => (
              <div
                key={`book-${book._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-yellow-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="relative">
                  {bookImages[book._id] ? (
                    <img
                      src={bookImages[book._id]}
                      alt={book.name}
                      className="w-full h-36 object-cover transform transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-36 bg-yellow-50 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                      <span className="text-yellow-600 dark:text-yellow-400 text-sm">Loading...</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h2 className="text-base font-semibold mb-1 text-yellow-800 dark:text-yellow-300 truncate">{book.name}</h2>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1 truncate">Genre: {book.genre}</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-2">ISBN: {book.isbn}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPdf(book._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 dark:bg-yellow-600 text-white py-1 px-2 rounded text-xs hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(book)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-500 dark:bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4 border border-yellow-200 dark:border-gray-700 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-300">Confirm Delete</h2>
                <button 
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBook(null);
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-yellow-700 dark:text-yellow-400">
                Are you sure you want to delete <span className="font-medium">"{selectedBook?.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBook(null);
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-3 py-1 text-xs bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteBook;