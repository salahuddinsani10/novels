import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import ViewBooks from "./ViewBooks";
import axios from "axios";
import Cookies from 'js-cookie';
import { Book, Star, Clock, BookOpen, BookMarked, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import API_BASE_URL from '../config';

const UserDeshboard = () => {
  const [userImage, setUserImage] = useState(null);
  const [userName, setUserName] = useState('Reader');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(Cookies.get('customerId'));
  const { isDark } = useTheme();
  
  // Stats for the dashboard (these would ideally come from an API)
  const [stats, setStats] = useState({
    booksRead: 0,
    booksInProgress: 0,
    favoriteBooks: 0,
    reviewsWritten: 0
  });

  useEffect(() => {
    // Check if userId is available, if not, handle the case (e.g., redirect or show a message)
    if (!userId) {
      console.error("User ID is not available.");
      return; // Prevent further execution
    }

    // API_BASE_URL is now imported at the top of the file
    
    // Fetch User image from API
    axios
      .get(`${API_BASE_URL}/api/user/customerImage/${userId}`, { responseType: "arraybuffer" }) // Try the /api/user endpoint
      .then((response) => {
        const imageBlob = new Blob([response.data], { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(imageBlob);
        setUserImage(imageUrl);
      })
      .catch((error) => {
        console.error("Error fetching user image", error);
        // Set a default image or handle error state
        setUserImage('/default-profile.png');
      })
      .finally(() => setLoading(false));

    // Fetch username from API
    axios
      .get(`${API_BASE_URL}/api/user/UserName/${userId}`)
      .then((response) => {
        setUserName(response.data);
      })
      .catch((error) => {
        console.error("Error fetching username", error);
        // Set a default username or handle error state
        setUserName('User');
      });
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center sm:text-left max-w-3xl mx-auto sm:mx-0 relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-900 dark:text-primary-100 mb-4 transition-colors duration-300">
              Welcome to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-300">reading journey</span>
            </h1>
            <p className="text-primary-700 dark:text-primary-300 text-lg mb-8 transition-colors duration-300">
              Discover new worlds, share your thoughts, and track your reading progress.
            </p>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link to="/CustomerHandling/books" className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 shadow-md">
                <BookOpen className="w-5 h-5" />
                <span>Explore Books</span>
              </Link>
              <Link to="/CustomerHandling/reading-experience" className="bg-white dark:bg-secondary-800 hover:bg-primary-50 dark:hover:bg-secondary-700 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2 border border-primary-200 dark:border-secondary-600 shadow-md">
                <BookMarked className="w-5 h-5" />
                <span>Reading Experience</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-200 dark:bg-primary-800/20 rounded-full opacity-50 blur-3xl transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-primary-300 dark:bg-primary-700/20 rounded-full opacity-30 blur-3xl transition-colors duration-300"></div>
      </div>
      
      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <Book className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-primary-800 dark:text-primary-300 transition-colors duration-300">Books Read</h3>
            </div>
            <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 transition-colors duration-300">{stats.booksRead}</p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h3 className="font-semibold text-primary-800 dark:text-primary-300 transition-colors duration-300">Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 transition-colors duration-300">{stats.reviewsWritten}</p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="font-semibold text-primary-800 dark:text-primary-300 transition-colors duration-300">Favorites</h3>
            </div>
            <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 transition-colors duration-300">{stats.favoriteBooks}</p>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              </div>
              <h3 className="font-semibold text-primary-800 dark:text-primary-300 transition-colors duration-300">In Progress</h3>
            </div>
            <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 transition-colors duration-300">{stats.booksInProgress}</p>
          </div>
        </div>
      </div>
      
      {/* Book Recommendations Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-300 transition-colors duration-300">Recommended For You</h2>
          <Link to="/CustomerHandling/books" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-300 text-sm font-medium flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>
        
        {/* Book List Section - This will be replaced by ViewBooks with specific filters */}
        <ViewBooks />
      </div>
      
      <Footer />
    </div>
  );
};

export default UserDeshboard;