import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import API_BASE_URL from '../config';
import Cookies from 'js-cookie';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

const StarRatingComponent = ({ rating, onChange }) => {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={24}
          onClick={() => onChange && onChange(star)}
          className={`cursor-pointer transform transition-all duration-200 ${star <= rating ? 'text-yellow-500 fill-yellow-500 scale-110' : 'text-gray-300 dark:text-gray-600 hover:scale-105'} ${onChange ? 'hover:text-yellow-400' : ''}`}
        />
      ))}
    </div>
  );
};

const AddReview = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [review, setReview] = useState({
    rating: 5,
    comment: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));

  useEffect(() => {
    const fetchData = async () => {
      if (!bookId) {
        setErrorMessage('Book ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch book details
        const bookResponse = await fetch(`${API_BASE_URL}/api/book/${bookId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Book fetch response status:', bookResponse.status);
        
        if (!bookResponse.ok) {
          if (bookResponse.status === 404) {
            throw new Error(`Book not found (ID: ${bookId})`);
          } else {
            throw new Error(`Failed to fetch book details: ${bookResponse.status}`);
          }
        }
        
        const bookData = await bookResponse.json();
        setBook(bookData);
        
        // Fetch reviews for this book
        const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews/book/${bookId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        } else {
          console.error('Error fetching reviews:', reviewsResponse.status);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load book details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [bookId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReview(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingChange = (newRating) => {
    setReview(prev => ({
      ...prev,
      rating: newRating
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get customerId if available, but don't require it
      const customerId = Cookies.get('customerId');
      
      // For anonymous reviews, we'll use a guest identifier if no customerId is available
      const reviewerId = customerId || 'guest-' + Math.random().toString(36).substring(2, 10);
      
      // Format review data according to backend expectations
      const reviewData = {
        bookId: bookId,
        customerId: reviewerId, // Use the available ID or guest ID
        rating: parseInt(review.rating), // Ensure rating is a number
        comment: review.comment // Backend expects 'comment' not 'description'
      };
      
      console.log('Review data being sent:', JSON.stringify(reviewData, null, 2));
      
      // Log the complete data being sent for debugging
      console.log('Full review data:', reviewData);
      
      // Using axios instead of fetch for better error handling
      try {
        console.log('Sending review with axios...');
        
        // Get the auth token from cookies
        const token = Cookies.get('token');
        
        if (!token) {
          throw new Error('Authentication required. Please log in to submit a review.');
        }
        
        // Create a direct axios request with authentication
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/api/reviews`,
          data: reviewData,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Axios automatically parses JSON and throws for error status codes
        console.log('Review submission successful!');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Success - already properly handled by axios
        const responseData = response.data;
        
      } catch (error) {
        // Axios error handling is more detailed
        console.log('Axios error:', error.message);
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          console.log('Error status:', error.response.status);
          console.log('Error data:', error.response.data);
          // Use the server's error message if available
          throw new Error(error.response.data?.message || 'Failed to submit review');
        } else if (error.request) {
          // Request was made but no response received
          console.log('No response received:', error.request);
          throw new Error('No response from server. Please try again later.');
        } else {
          // Something else caused the error
          throw new Error('Error setting up request: ' + error.message);
        }
      }
      
      // Success - redirect back to book details page
      alert('Review submitted successfully!');
      navigate(`/CustomerHandling/books/${bookId}`);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage(error.message || 'Error submitting review. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400 transition-colors duration-300"></div>
          </div>
        ) : null}
      </div>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-md text-red-600 dark:text-red-400 transition-colors duration-300 max-w-xl mx-auto">
        <p className="mb-4">{errorMessage}</p>
        <button 
          onClick={() => navigate('/CustomerHandling/books')} 
          className="mt-4 px-6 py-2.5 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-300 shadow-sm font-medium"
        >
          Return to Books
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto mt-8 mb-12">
      {book ? (
        <>
          <div className="mb-8 bg-white dark:bg-secondary-900 rounded-xl p-4 sm:p-6 shadow-lg transition-colors duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Book Cover Image */}
              <div className="flex-shrink-0 w-full sm:w-1/4 max-w-[200px] mx-auto sm:mx-0">
                {book.coverImage ? (
                  <img 
                    src={`${API_BASE_URL}/${book.coverImage}`} 
                    alt={book.name} 
                    className="w-full h-auto object-cover rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary-100 to-primary-200 dark:from-secondary-700 dark:to-secondary-600 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-lg">
                    <span className="text-primary-500 dark:text-primary-400 transition-colors duration-300 font-medium">No cover available</span>
                  </div>
                )}
              </div>
              {/* Book Details */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 dark:text-primary-300 mb-2 transition-colors duration-300 leading-tight">{book.name}</h1>
                <p className="text-primary-600 dark:text-primary-500 mb-1 transition-colors duration-300 text-sm sm:text-base">
                  By {book.author?.name || 'Unknown Author'}
                </p>
                
                <div className="flex flex-wrap gap-2 my-3">
                  <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-xs rounded-full">
                    {book.genre || 'Uncategorized'}
                  </span>
                  <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-xs rounded-full">
                    ISBN: {book.isbn || 'N/A'}
                  </span>
                </div>
                
                <div className="flex mt-6">
                  <button
                    onClick={() => navigate(`/CustomerHandling/books/${bookId}`)}
                    className="py-2 px-4 bg-white dark:bg-secondary-800 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors duration-300 border border-primary-200 dark:border-secondary-700 shadow-sm flex items-center gap-2 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Book
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Reviews Section */}
          <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl shadow-lg mb-8 transition-colors duration-300">
            <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-4 transition-colors duration-300">Reviews ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <p className="text-secondary-500 dark:text-secondary-400 italic transition-colors duration-300">No reviews yet. Be the first to review this book!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-secondary-200 dark:border-secondary-700 pb-4 mb-4 last:border-0 transition-colors duration-300">
                    <div className="flex items-center mb-2">
                      {review.customer?.profilePicture ? (
                        <img 
                          src={`${API_BASE_URL}${review.customer.profilePicture}`} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center mr-3 transition-colors duration-300">
                          <User size={20} className="text-secondary-500 dark:text-secondary-400 transition-colors duration-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">
                          {review.customer?.name || 'Anonymous User'}
                        </p>
                        <div className="flex items-center">
                          <StarRatingComponent rating={review.rating} />
                          <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2 transition-colors duration-300">
                            {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary-700 dark:text-secondary-300 ml-13 transition-colors duration-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Review Form - Only show if logged in */}
          {isLoggedIn ? (
            <div className="p-4 sm:p-6 bg-white dark:bg-secondary-900 rounded-xl shadow-lg transition-colors duration-300 border border-primary-100 dark:border-secondary-800">
              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-4 transition-colors duration-300 border-b border-primary-100 dark:border-secondary-800 pb-2">Write a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-primary-700 dark:text-primary-400 mb-3 transition-colors duration-300 font-medium">Your Rating</label>
                  <div className="bg-primary-50 dark:bg-secondary-800 p-4 rounded-lg flex justify-center">
                    <StarRatingComponent 
                      rating={review.rating} 
                      onChange={handleRatingChange} 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comment" className="block text-primary-700 dark:text-primary-400 mb-2 transition-colors duration-300 font-medium">Your Review</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={review.comment}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-primary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-300 shadow-sm"
                    placeholder="Write your review..."
                    required
                  ></textarea>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/CustomerHandling/books/${bookId}`)}
                    className="sm:flex-1 py-3 px-4 bg-white dark:bg-secondary-800 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors duration-300 border border-primary-200 dark:border-secondary-700 shadow-sm font-medium"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="sm:flex-1 py-3 px-4 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-300 shadow-md font-medium"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl shadow-lg text-center transition-colors duration-300 border border-primary-100 dark:border-secondary-800">
              <div className="bg-primary-50 dark:bg-secondary-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-500 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-2">Account Required</h3>
              <p className="mb-6 text-secondary-600 dark:text-secondary-400 transition-colors duration-300 max-w-md mx-auto">You need to be logged in to share your thoughts about this book.</p>
              <button
                onClick={() => navigate('/login')}
                className="py-2.5 px-6 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-300 shadow-md font-medium"
              >
                Log In to Review
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8 bg-white dark:bg-secondary-900 rounded-xl shadow-lg max-w-lg mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-primary-300 dark:text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-2">Book Not Found</h3>
          <p className="text-primary-600 dark:text-primary-500 mb-6 transition-colors duration-300">
            This book may have been removed or is no longer available.
          </p>
          <button
            onClick={() => navigate('/CustomerHandling/books')}
            className="py-2.5 px-6 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-300 shadow-md font-medium"
          >
            Browse Other Books
          </button>
        </div>
      )}
    </div>
  );
};

// Make sure this export is properly recognized
export default AddReview;