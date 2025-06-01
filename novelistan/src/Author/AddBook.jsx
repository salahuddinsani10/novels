import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useTheme } from '../contexts/ThemeContext';
import { BookOpen, ImagePlus, CheckCircle, AlertCircle, BookPlus } from 'lucide-react';
import API_BASE_URL from '../config';

const AddBook = () => {
  const { isDark } = useTheme();
  const [book, setBook] = useState({
    name: '',
    isbn: '',
    genre: ''
  });
  const [bookFile, setBookFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({
      ...prev,
      [name]: name === 'isbn' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'book') {
      setBookFile(file);
    } else {
      setCoverImage(file);
    }
  };

  const validateForm = () => {
    if (!book.name || !book.isbn || !book.genre) {
      setError('Please fill in all fields');
      return false;
    }
    if (!bookFile) {
      setError('Please upload a book file');
      return false;
    }
    if (!coverImage) {
      setError('Please upload a cover image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('book', JSON.stringify({
        name: book.name,
        isbn: String(book.isbn), // Convert to string to avoid ObjectId casting issues
        genre: book.genre
      }));
      formData.append('bookFile', bookFile, bookFile.name); // Include filename
      formData.append('coverImage', coverImage, coverImage.name); // Include filename

      console.log('Submitting book...', {
        book: book,
        bookFile: bookFile.name,
        coverImage: coverImage.name
      });

      const token = Cookies.get('token') || localStorage.getItem('token');
      console.log('Token:', token); // Log token for debugging

      const response = await fetch(`${API_BASE_URL}/api/book/addBook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = { message: 'No JSON response', error: err.message };
      }
      console.log('Response data:', data);

      if (response.ok) {
        setSuccess('Book added successfully!');
        setError('');
        setBook({
          name: '',
          isbn: '',
          genre: ''
        });
        setBookFile(null);
        setCoverImage(null);
        document.getElementById('bookFile').value = '';
        document.getElementById('coverImage').value = '';
      } else {
        setError(data.message || `Failed to add book. Status: ${response.status}`);
        setSuccess('');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      setError(error.message || 'Error adding book. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-secondary-950 p-4 transition-colors duration-300">
      <section className="w-full max-w-4xl mx-auto bg-white dark:bg-secondary-900 rounded-xl shadow-xl border border-primary-100 dark:border-secondary-800 transition-all duration-300 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {/* Left side - Header and Preview */}
          <div className="bg-primary-500 dark:bg-primary-700 md:col-span-2 p-6 flex flex-col justify-between">
            <div>
              <div className="bg-white/20 dark:bg-white/10 rounded-full p-3 w-fit mb-6 transition-colors duration-300">
                <BookPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Add New Book</h2>
              <p className="text-primary-100 text-sm mb-6">
                Share your literary work with readers around the world.
              </p>
              
              {/* Book Cover Preview */}
              <div className="mt-4 relative">
                {coverImage ? (
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Cover Preview"
                    className="rounded-lg shadow-lg border-2 border-white/30 object-cover aspect-[2/3] max-w-[200px]"
                  />
                ) : (
                  <div className="bg-primary-400/30 dark:bg-primary-800/50 rounded-lg border-2 border-dashed border-white/40 flex flex-col items-center justify-center p-6 aspect-[2/3] max-w-[200px]">
                    <ImagePlus className="w-8 h-8 text-white/70 mb-2" />
                    <p className="text-white/70 text-xs text-center">Upload a cover image</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Messages */}
            <div className="mt-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-white p-3 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-500/30 text-white p-3 rounded-lg flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="md:col-span-3 p-6 bg-white dark:bg-secondary-900">
            <form onSubmit={handleSubmit} className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Book Title */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="name" className="font-medium text-secondary-700 dark:text-primary-300 flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    Book Title
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={book.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-primary-100 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:outline-none transition-colors duration-300"
                    placeholder="e.g. The Great Novel"
                    required
                  />
                </div>

                {/* ISBN */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="isbn" className="font-medium text-secondary-700 dark:text-primary-300 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                    ISBN
                  </label>
                  <input
                    id="isbn"
                    name="isbn"
                    type="number"
                    value={book.isbn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-primary-100 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:outline-none transition-colors duration-300"
                    placeholder="e.g. 9781234567897"
                    required
                  />
                </div>

                {/* Genre */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="genre" className="font-medium text-secondary-700 dark:text-primary-300 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Genre
                  </label>
                  <input
                    id="genre"
                    name="genre"
                    type="text"
                    value={book.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-primary-100 focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:outline-none transition-colors duration-300"
                    placeholder="e.g. Science Fiction"
                    required
                  />
                </div>

                {/* Book File */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="bookFile" className="font-medium text-secondary-700 dark:text-primary-300 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Book File (PDF)
                  </label>
                  <div className="relative">
                    <input
                      id="bookFile"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, 'book')}
                      className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-primary-100 file:bg-primary-100 dark:file:bg-primary-700 file:text-primary-800 dark:file:text-primary-300 file:rounded-lg file:px-3 file:py-1 file:border-0 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-colors duration-300"
                      required
                    />
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">PDF only. Max size: 5MB.</p>
                    {bookFile && (
                      <div className="absolute right-2 top-2 bg-green-500/10 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded">
                        File selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="coverImage" className="font-medium text-secondary-700 dark:text-primary-300 flex items-center gap-2 text-sm">
                    <ImagePlus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    Cover Image
                  </label>
                  <div className="relative">
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover')}
                      className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-primary-100 file:bg-primary-100 dark:file:bg-primary-700 file:text-primary-800 dark:file:text-primary-300 file:rounded-lg file:px-3 file:py-1 file:border-0 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-colors duration-300"
                      required
                    />
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">JPG, PNG or GIF. Max size: 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-base"
                >
                  <BookPlus className="w-5 h-5" />
                  {loading ? 'Adding Book...' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AddBook;