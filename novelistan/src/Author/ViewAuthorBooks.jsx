import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const ViewAuthorBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        const authorId = Cookies.get('authorId');
        
        // Validate token and authorId
        if (!token || !authorId) {
          // Redirect to login if no token
          window.location.href = '/login';
          return;
        }

        // Check token expiration
        const tokenExpiration = Cookies.get('tokenExpiration');
        if (tokenExpiration && new Date(tokenExpiration) < new Date()) {
          // Token expired, redirect to login
          window.location.href = '/login';
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/book/authorBook/${authorId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              // Unauthorized or forbidden, redirect to login
              window.location.href = '/login';
              return;
            }
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }

          const data = await response.json();
          setBooks(data);
        } catch (error) {
          setError(error.message || 'Failed to load books. Please try again later.');
          console.error('Error fetching books:', error);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        setError(error.message || 'Failed to load books. Please try again later.');
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBooks();
  }, []);
  
  const handleDelete = async (bookId) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the book.');
      }

      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete the book. Please try again later.');
    }
  };

  const viewPdf = async (book) => {
    try {
      if (!book || !book._id) {
        throw new Error('Book information not available');
        return;
      }
      
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE_URL}/api/book/pdf/${book._id}`, {
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
      
      // Clean up the Blob URL after opening
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open PDF. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Books</h1>
      
      {books.length === 0 ? (
        <div className="text-center text-gray-500">
          No books found. Start by adding some books!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div 
              key={book._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48">
                <img
                  src={`${API_BASE_URL}/api/book/cover/${book._id}`} 
                  alt={book.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-book.png';
                  }}
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {book.name}
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">ISBN:</span> {book.isbn}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Genre:</span> {book.genre}
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => navigate(`/author/update-book/${book._id}`)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                <button 
                  onClick={() => viewPdf(book)}
                  className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  View PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAuthorBooks;
