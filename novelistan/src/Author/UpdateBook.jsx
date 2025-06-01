import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Edit2, BookOpen, Search, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

import API_BASE_URL from '../config';

const UpdateBook = () => {
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookImages, setBookImages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    isbn: '',
    genre: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAuthorBooks();
    return () => {
      Object.values(bookImages).forEach((url, index) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, []);

  useEffect(() => {
    // Load images for all books
    books.forEach((book, index) => {
      if (book._id && !bookImages[book._id]) {
        fetchBookImage(book._id);
      }
    });
  }, [books, bookImages]);

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
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBookImages((prev) => ({
        ...prev,
        [bookId]: imageUrl,
      }));
    } catch (err) {
      console.error(`Error fetching image for book ${bookId}:`, err);
      setBookImages((prev) => ({
        ...prev,
        [bookId]: null,
      }));
    }
  };

  const viewPdf = async (bookId) => {
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
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error(`Error fetching PDF for book ${bookId}:`, err);
      setError('Failed to load PDF. Please try again.');
    }
  };

  const handleUpdateClick = (book) => {
    setSelectedBook(book);
    setUpdateFormData({
      name: book.name,
      isbn: book.isbn,
      genre: book.genre,
    });
    setShowUpdateModal(true);
    setError(null);
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFiles = () => {
    if (newImage && !newImage.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return false;
    }

    if (newFile && newFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return false;
    }

    const maxSize = 5 * 1024 * 1024;
    if (newImage && newImage.size > maxSize) {
      setError('Image file size should be less than 5MB');
      return false;
    }

    if (newFile && newFile.size > maxSize) {
      setError('PDF file size should be less than 5MB');
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const imageUrl = URL.createObjectURL(file);
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setPreviewImage(imageUrl);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile(file);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBook || isSubmitting) return;

    if (!validateFiles()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess('');

    try {
      const formData = new FormData();
      const bookData = {
        ...updateFormData,
        author: selectedBook.author,
      };
      
      formData.append('book', JSON.stringify(bookData));
      
      if (newImage) {
        formData.append('coverImage', newImage);
      }
      
      if (newFile) {
        formData.append('bookFile', newFile);
      }

      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/${selectedBook._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const responseData = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(responseData);
      } catch (e) {
        parsedData = responseData;
      }

      if (!response.ok) {
        throw new Error(typeof parsedData === 'string' ? parsedData : 'Failed to update book');
      }

      setBooks(books.map((book) => 
        book._id === selectedBook._id ? parsedData : book
      ));
      
      if (bookImages[selectedBook._id]?.startsWith('blob:')) {
        URL.revokeObjectURL(bookImages[selectedBook._id]);
      }
      
      await fetchBookImage(selectedBook._id);
      
      setSuccess('Book updated successfully!');
      
      setTimeout(() => {
        setShowUpdateModal(false);
        setSelectedBook(null);
        setNewImage(null);
        setNewFile(null);
        setPreviewImage(null);
        setSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Error updating book:', err);
      setError(err.message || 'Failed to update book');
    } finally {
      setIsSubmitting(false);
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
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');

      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setError('Failed to open PDF');
    }
  };

  if (loading) {
    return (
      <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="text-lg animate-pulse">Loading books...</div>
      </div>
    );
  }

  // Ensure we have books and all books have valid _id fields
  const validBooks = books.filter(book => book && book._id);

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Update Books
      </h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-3 mb-4 rounded text-sm" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-8 transform transition-all duration-300 hover:scale-102">
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm transition-colors duration-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {validBooks
          .filter(book =>
            book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.isbn.toString().includes(searchQuery)
          )
          .map((book) => (
            <div
              key={book._id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-yellow-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-600 transform hover:scale-[1.02]"
            >
              <div className="aspect-square relative overflow-hidden">
                {bookImages[book._id] ? (
                  <img
                    src={bookImages[book._id]}
                    alt={book.name}
                    className="w-full h-40 object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h2 className="text-lg font-semibold mb-1 text-yellow-800 dark:text-yellow-300 line-clamp-1">{book.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Genre: {book.genre}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">ISBN: {book.isbn}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => book._id && handleViewPdf(book._id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-yellow-500 dark:bg-yellow-600 text-white py-1.5 px-2 rounded text-sm hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    View PDF
                  </button>
                  <button
                    onClick={() => handleUpdateClick(book)}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-500 dark:bg-green-600 text-white py-1.5 px-2 rounded text-sm hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-300">
            <h1 className="text-2xl font-bold mb-6 text-center text-yellow-800 dark:text-yellow-300">Update Book</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fadeIn">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-3 mb-4 rounded text-sm" role="alert">
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmitUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={updateFormData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ISBN</label>
                <input
                  type="number"
                  name="isbn"
                  value={updateFormData.isbn}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={updateFormData.genre}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Cover Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New PDF File (optional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedBook(null);
                    setNewImage(null);
                    setNewFile(null);
                    setPreviewImage(null);
                    setError('');
                    setSuccess('');
                  }}
                  className="bg-gray-400 dark:bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-500 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Updating...' : 'Update Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateBook;