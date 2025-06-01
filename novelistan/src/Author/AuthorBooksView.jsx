import React, { useState, useEffect } from 'react';

const AuthorBooksView = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get author ID from localStorage
  const authorId = localStorage.getItem('authorId');

  useEffect(() => {
    fetchAuthorBooks();
  }, []);

  const fetchAuthorBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/book/authorBook/${authorId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (isbn) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`/api/book/${isbn}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh the books list
          fetchAuthorBooks();
          alert('Book deleted successfully');
        } else {
          throw new Error('Failed to delete book');
        }
      } catch (err) {
        alert('Error deleting book: ' + err.message);
      }
    }
  };

  const handleUpdate = async (book) => {
    // Store the selected book for editing
    localStorage.setItem('editBook', JSON.stringify(book));
    // You can implement navigation to edit form or show edit modal
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-yellow-600 text-lg">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-lg">Error: {error}</div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">No books found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.isbn} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {book.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={`/api/book/BookImage${book.id}`}
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">{book.name}</h3>
              <div className="text-gray-600 mb-2">
                <p>ISBN: {book.isbn}</p>
                <p>Genre: {book.genre}</p>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleUpdate(book)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book.isbn)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Book Button */}
      <div className="fixed bottom-8 right-8">
        <button 
          onClick={() => {/* Implement add book logic */}}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-full shadow-lg transition-colors"
        >
          + Add New Book
        </button>
      </div>
    </div>
  );
};

export default AuthorBooksView;