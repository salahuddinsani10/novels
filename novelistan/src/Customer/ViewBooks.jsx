import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, BookOpen, Star, ChevronLeft, User, FileText, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config';
import Cookies from 'js-cookie';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

const StarRatingComponent = ({ rating, onChange }) => {
  const { isDark } = useTheme();
  return (
    <div className="flex text-primary-500 dark:text-primary-400 transition-colors duration-300">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          onClick={() => onChange && onChange(index + 1)}
          className={`w-5 h-5 cursor-pointer ${index < rating ? 'fill-primary-500 dark:fill-primary-400' : 'fill-none'} transition-colors duration-300`}
        />
      ))}
    </div>
  );
};

const ViewBooks = () => {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const { isDark } = useTheme();
  const [books, setBooks] = useState([]);
  const [groupedBooks, setGroupedBooks] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('name');
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));
  const [searchTerm, setSearchTerm] = useState('');
  const [imageError, setImageError] = useState({});
  const [customerToken, setCustomerToken] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [bookSummary, setBookSummary] = useState('');

  const validateToken = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      // Not strictly an error, just set token to null
      setCustomerToken(null);
      return null;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser || !parsedUser.id || parsedUser.role !== 'customer') {
        throw new Error('Invalid user data or not a customer');
      }
      setCustomerToken(token);
      return token;
    } catch (error) {
      console.error('Token validation warning:', error);
      // Clear invalid token, but don't block functionality
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCustomerToken(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      const token = validateToken();
      // Always fetch books, regardless of token status
      await fetchBooks();
      // We don't need to alert here as we're already in the customer area after login
    };

    initializeComponent();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm && validateToken()) {
        handleSearch();
      } else if (!searchTerm) {
        fetchBooks();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchType]);

  const fetchBooks = async () => {
    const token = validateToken();

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/book/list/allBooks`, { headers });

      if (!response.ok) {
        // If unauthorized, try without token
        if (response.status === 401 && token) {
          return fetchBooksWithoutAuth();
        }
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data);
      groupBooksByGenre(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      // Fallback to unauthenticated fetch
      return fetchBooksWithoutAuth();
    }
  };

  const fetchBooksWithoutAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/book/list/allBooks`);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data);
      groupBooksByGenre(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books without auth:', error);
      setLoading(false);
      alert('Unable to load books. Please check your connection.');
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let endpoint;
      switch (searchType) {
        case 'genre':
          endpoint = `${API_BASE_URL}/api/book/search/BookByGenre?search=${encodeURIComponent(searchTerm)}`;
          break;
        case 'isbn':
          endpoint = `${API_BASE_URL}/api/book/${searchTerm}`;
          break;
        default:
          endpoint = `${API_BASE_URL}/api/book/search/Book?search=${encodeURIComponent(searchTerm)}`;
          break;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      
      const booksArray = searchType === 'isbn' ? (data ? [data] : []) : (Array.isArray(data) ? data : []);
      setBooks(booksArray);
      groupBooksByGenre(booksArray);
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupBooksByGenre = (booksList) => {
    const grouped = booksList.reduce((acc, book) => {
      if (!acc[book.genre]) {
        acc[book.genre] = [];
      }
      acc[book.genre].push(book);
      return acc;
    }, {});
    setGroupedBooks(grouped);
  };

  const handleImageError = (bookId) => {
    setImageError(prev => ({
      ...prev,
      [bookId]: true
    }));
  };

  const viewPdf = async (book) => {
    try {
      if (!book || !book.bookFile) {
        throw new Error('Book PDF file not available');
      }
      
      // Extract the filename from the full path
      const filePath = book.bookFile;
      const fileName = filePath.split('\\').pop().split('/').pop();
      
      // Check if the file path is already a complete URL (starts with http:// or https://)
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // It's a full URL (Azure Blob Storage), open it directly
        window.open(filePath, '_blank');
      } else {
        // It's a relative path, prepend the API base URL
        window.open(`${API_BASE_URL}/${filePath}`, '_blank');
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open PDF. Please try again later.');
    }
  };

  const openBookDetails = async (book) => {
    setBookSummary(''); // Reset summary when opening a new book
    const fetchReviews = async (book) => {
      try {
        // Fetch reviews without authentication
        const response = await fetch(`${API_BASE_URL}/api/reviews/book/${book._id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          setReviews([]);
          return;
        }
        const reviewsData = await response.json();
        setReviews(reviewsData || []);
      } catch (error) {
        setReviews([]);
      }
    };
    setSelectedBook(book);
    await fetchReviews(book);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Get authentication token
    const token = Cookies.get('token');
    
    if (!token) {
      alert('You need to be logged in to submit a review');
      navigate('/login');
      return;
    }

    try {
      // Format review data according to backend expectations
      const reviewData = {
        bookId: selectedBook._id,
        rating: parseInt(newReview.rating), // Ensure rating is a number
        comment: newReview.comment // Backend expects 'comment' not 'description'
      };
      
      console.log('Review data being sent:', JSON.stringify(reviewData, null, 2));
      
      // Send the authenticated request
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      
      console.log('Review submission response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please log in again.');
          Cookies.remove('token');
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit review');
      }

      // Clear form
      setNewReview({ rating: 5, comment: '' });
      
      // Refresh reviews
      console.log('Refreshing reviews for book:', selectedBook._id);
      // Fetch updated reviews without authentication
      const updatedReviewsResponse = await fetch(`${API_BASE_URL}/api/reviews/book/${selectedBook._id}`, {
        headers: { 
          'Content-Type': 'application/json'
          // No Authorization header needed
        }
      });
      
      console.log('Refresh reviews response status:', updatedReviewsResponse.status);

      if (!updatedReviewsResponse.ok) {
        console.log(`Reviews refresh returned status: ${updatedReviewsResponse.status}. Continuing with existing reviews.`);
        return;
      }

      const updatedReviews = await updatedReviewsResponse.json();
      setReviews(updatedReviews || []);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Error submitting review. Please try again.');
    }
  };

  // Get the cover image URL using the book's coverImage field
  const fetchCoverImageUrl = (book) => {
    if (!book || !book.coverImage) {
      // Return a placeholder image if no cover is available
      return "https://placehold.co/200x300/yellow/white?text=No+Cover";
    }
    
    const coverPath = book.coverImage;
    
    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      // If it's already a full URL (Azure Blob Storage), return it directly
      return coverPath;
    } else {
      // Otherwise prepend the API base URL
      return `${API_BASE_URL}/${coverPath}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 transition-colors duration-300">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 shadow-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary-300 dark:text-primary-300" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-32 py-4 rounded-xl bg-primary-700/50 dark:bg-primary-800/50 text-white placeholder-primary-200 border-2 border-primary-500/30 dark:border-primary-500/20 focus:border-primary-400 focus:ring-2 focus:ring-primary-400 transition-all duration-300"
              placeholder="Search for your next adventure..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="h-full py-0 pl-4 pr-8 border-transparent bg-transparent text-primary-200 dark:text-primary-300 font-medium focus:ring-0 cursor-pointer transition-colors duration-300"
              >
                <option value="name" className="text-gray-900">Name</option>
                <option value="isbn" className="text-gray-900">ISBN</option>
                <option value="genre" className="text-gray-900">Genre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedBook ? (
          <div className="space-y-12">
            <h1 className="text-4xl font-bold text-primary-700 dark:text-primary-400 border-b-4 border-primary-500 dark:border-primary-600 pb-4 inline-block transition-colors duration-300">
              Book Collection
            </h1>
            
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 dark:border-primary-500"></div>
                <span className="ml-4 text-primary-700 dark:text-primary-400 animate-pulse transition-colors duration-300">Loading books...</span>
              </div>
            ) : Object.keys(groupedBooks).length === 0 ? (
              <div className="text-center py-20 text-primary-700 dark:text-primary-400 transition-colors duration-300">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50 animate-bounce text-primary-500 dark:text-primary-400" />
                <p className="text-xl font-semibold">No books found</p>
                <p className="text-primary-600 dark:text-primary-500 mt-2 transition-colors duration-300">Try changing your search or check back later!</p>
              </div>
            ) : (
              Object.entries(groupedBooks).map(([genre, genreBooks], genreIndex) => (
                <div key={`genre-${genreIndex}`} className="space-y-6">
                  <h2 className="text-3xl font-semibold text-primary-700 dark:text-primary-400 border-b-2 border-primary-300 dark:border-primary-700 pb-2 transition-colors duration-300">{genre}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {genreBooks.map((book, bookIndex) => (
                      <div
                        key={`${genre}-book-${book._id || bookIndex}`}
                        onClick={() => openBookDetails(book)}
                        className="group cursor-pointer bg-white dark:bg-secondary-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4"
                      >
                        {!imageError[book._id] ? (
                          <img
                            src={fetchCoverImageUrl(book)}
                            alt={book.name}
                            className="w-full h-56 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            onError={() => handleImageError(book._id)}
                          />
                        ) : (
                          <div className="w-full h-56 bg-primary-50 dark:bg-secondary-700 flex items-center justify-center rounded-lg transition-colors duration-300">
                            <BookOpen className="w-12 h-12 text-primary-300 dark:text-primary-400 animate-pulse transition-colors duration-300" />
                          </div>
                        )}
                        <div className="pt-4">
                          <h3 className="text-xl font-bold text-primary-800 dark:text-primary-300 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                            {book.name}
                          </h3>
                          <p className="text-primary-600 dark:text-primary-500 opacity-75 transition-colors duration-300">ISBN: {book.isbn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-secondary-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative transition-colors duration-300">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 left-4 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200 transition-colors duration-300"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <div className="p-8 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {!imageError[selectedBook._id] ? (
                      <img
                        src={fetchCoverImageUrl(selectedBook)}
                        alt={selectedBook.name}
                        className="w-full rounded-xl shadow-lg"
                        onError={() => handleImageError(selectedBook._id)}
                      />
                    ) : (
                      <div className="w-full h-96 bg-primary-50 dark:bg-secondary-800 rounded-xl flex items-center justify-center transition-colors duration-300">
                        <BookOpen className="w-20 h-20 text-primary-300 dark:text-primary-500 animate-pulse transition-colors duration-300" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <button 
                        onClick={() => viewPdf(selectedBook)}
                        className="w-full bg-primary-500 dark:bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-5 h-5" />
                        <span>View PDF</span>
                      </button>
                      <button 
                        onClick={() => navigate(`/CustomerHandling/add-review/${selectedBook._id}`)}
                        className="w-full bg-primary-700 dark:bg-primary-800 text-white px-4 py-3 rounded-lg hover:bg-primary-800 dark:hover:bg-primary-900 transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
                      >
                        <Star className="w-5 h-5" />
                        <span>Write a Review</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (isGeneratingSummary) return;
                          setIsGeneratingSummary(true);
                          try {
                            const response = await fetch(`${API_BASE_URL}/api/book/${selectedBook._id}/summary`);
                            if (!response.ok) throw new Error('Failed to generate summary');
                            const data = await response.json();
                            setBookSummary(data.summary || 'No summary available');
                          } catch (error) {
                            console.error('Error generating summary:', error);
                            setBookSummary('Failed to generate summary. Please try again later.');
                          } finally {
                            setIsGeneratingSummary(false);
                          }
                        }}
                        disabled={isGeneratingSummary}
                        className="w-full bg-primary-600 dark:bg-primary-700 text-white px-4 py-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-300 font-medium flex items-center justify-center space-x-2"
                      >
                        {isGeneratingSummary ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-5 h-5" />
                            <span>Generate Summary</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-400 mb-4 transition-colors duration-300">{selectedBook.name}</h2>
                      <p className="text-primary-600 dark:text-primary-500 transition-colors duration-300">Genre: {selectedBook.genre}</p>
                      <p className="text-primary-600 dark:text-primary-500 transition-colors duration-300">ISBN: {selectedBook.isbn}</p>
                    </div>
                    <div>
                      {bookSummary && (
                        <div className="mb-6 bg-primary-50 dark:bg-secondary-800 p-4 rounded-xl transition-colors duration-300">
                          <h3 className="text-xl font-semibold text-primary-700 dark:text-primary-400 mb-2 transition-colors duration-300">
                            Book Summary
                          </h3>
                          <p className="text-primary-800 dark:text-primary-300 whitespace-pre-line">
                            {bookSummary}
                          </p>
                        </div>
                      )}
                      <h3 className="text-2xl font-semibold text-primary-800 dark:text-primary-400 mb-4 transition-colors duration-300">Reviews</h3>
                      {reviews.length > 0 ? (
                        <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                          {reviews.map((review, index) => (
                            <div key={`review-${index}`} className="bg-primary-50 dark:bg-secondary-800 p-4 rounded-xl transition-colors duration-300">
                              <div className="flex items-center mb-2">
                                {review.customer?.profilePicture ? (
                                  <img 
                                    src={`${API_BASE_URL}${review.customer.profilePicture}`} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center mr-3 transition-colors duration-300">
                                    <User size={16} className="text-primary-700 dark:text-primary-300 transition-colors duration-300" />
                                  </div>
                                )}
                                <div>
                                  <span className="text-primary-700 dark:text-primary-400 font-medium transition-colors duration-300">{review.customer?.name || 'Anonymous User'}</span>
                                  <div className="flex items-center">
                                    <StarRatingComponent rating={review.rating || 5} />
                                    <span className="text-xs text-primary-500 dark:text-primary-500 ml-2 transition-colors duration-300">
                                      {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-primary-800 dark:text-primary-300 ml-11 transition-colors duration-300">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-primary-600 dark:text-primary-500 mb-6 transition-colors duration-300">No reviews yet. Be the first to review!</p>
                      )}
                      
                      {isLoggedIn ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4 bg-primary-50 dark:bg-secondary-800 p-4 rounded-xl transition-colors duration-300">
                          <h4 className="font-semibold text-primary-700 dark:text-primary-400 transition-colors duration-300">Write a Review</h4>
                          <div>
                            <label className="block text-primary-700 dark:text-primary-400 mb-2 transition-colors duration-300">Your Review</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                              className="w-full p-4 rounded-xl border-2 border-primary-300 dark:border-primary-700 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-200 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none transition-colors duration-300"
                              placeholder="Write your review..."
                              rows="4"
                              required
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-primary-700 dark:text-primary-400 transition-colors duration-300">Rating:</span>
                              <StarRatingComponent 
                                rating={newReview.rating} 
                                onChange={(rating) => setNewReview(prev => ({ ...prev, rating }))} 
                              />
                            </div>
                            <button 
                              type="submit" 
                              className="bg-primary-500 dark:bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300"
                            >
                              Submit Review
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-primary-50 dark:bg-secondary-800 p-4 rounded-xl text-center transition-colors duration-300">
                          <p className="text-primary-700 dark:text-primary-400 mb-2 transition-colors duration-300">Sign in to leave a review</p>
                          <button
                            onClick={() => navigate('/login')}
                            className="bg-primary-500 dark:bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300"
                          >
                            Log In to Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ViewBooks;
