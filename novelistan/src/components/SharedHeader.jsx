import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Bell, Search, Sun, Moon, User, Book, PenTool } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import API_BASE_URL from '../config';

// Default avatar constants
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=ffe066&color=7d5a00&rounded=true&size=96";
const DEFAULT_AVATAR_DARK = "https://ui-avatars.com/api/?name=User&background=5f4d00&color=ffe066&rounded=true&size=96";
const AUTHOR_DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Author&background=ffd580&color=8c5000&rounded=true&size=96";
const AUTHOR_DEFAULT_AVATAR_DARK = "https://ui-avatars.com/api/?name=Author&background=704000&color=ffd580&rounded=true&size=96";

const SharedHeader = ({ userRole = 'customer' }) => {
  const { isDark, toggleDarkMode } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userImage, setUserImage] = useState('');
  const location = useLocation();
  
  // Get user info from cookies
  const customerId = Cookies.get('customerId');
  const authorId = Cookies.get('authorId');
  const userId = userRole === 'author' ? authorId : customerId;
  const userName = (userRole === 'author' ? Cookies.get('authorName') : Cookies.get('customerName')) || (userRole === 'author' ? 'Author' : 'Reader');
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fetch user image from API or generate avatar
  useEffect(() => {
    // Function to generate a fallback avatar
    const generateAvatar = () => {
      const backgroundColor = isDark 
        ? (userRole === 'author' ? '704000' : '5f4d00') 
        : (userRole === 'author' ? 'ffd580' : 'ffe066');
      
      const textColor = isDark 
        ? (userRole === 'author' ? 'ffd580' : 'ffe066') 
        : (userRole === 'author' ? '8c5000' : '7d5a00');
      
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=${backgroundColor}&color=${textColor}&rounded=true&size=96`;
    };
    
    if (!userId) {
      setUserImage(generateAvatar());
      return;
    }
    
    // Try to fetch user image from API with the correct endpoint path
    const endpoint = userRole === 'author'
      ? `${API_BASE_URL}/api/author/authorImage/${userId}` // Use author route for author images
      : `${API_BASE_URL}/api/user/customerImage/${userId}`; // Use user route for customer images
      
    axios
      .get(endpoint, { responseType: "arraybuffer" })
      .then((response) => {
        const imageBlob = new Blob([response.data], { type: "image/jpeg" });
        const imageUrl = URL.createObjectURL(imageBlob);
        setUserImage(imageUrl);
      })
      .catch((error) => {
        console.error(`Error fetching ${userRole} image:`, error);
        // Generate fallback avatar on error
        setUserImage(generateAvatar());
      });
  }, [userId, userName, isDark, userRole]);
  
  // Color themes based on user role
  const themeColors = {
    customer: {
      gradientFrom: 'from-primary-600',
      gradientTo: 'to-primary-500',
      darkGradientFrom: 'dark:from-primary-700',
      darkGradientTo: 'dark:to-primary-800',
      highlight: 'text-primary-400',
      darkHighlight: 'dark:text-primary-400',
      avatar: {
        bg: 'bg-primary-200',
        darkBg: 'dark:bg-primary-700',
        text: 'text-primary-700',
        darkText: 'dark:text-white'
      },
      hover: {
        light: 'hover:bg-primary-100',
        dark: 'dark:hover:bg-secondary-700'
      }
    },
    author: {
      gradientFrom: 'from-yellow-600',
      gradientTo: 'to-yellow-500',
      darkGradientFrom: 'dark:from-yellow-700',
      darkGradientTo: 'dark:to-yellow-800',
      highlight: 'text-yellow-400',
      darkHighlight: 'dark:text-yellow-400',
      avatar: {
        bg: 'bg-yellow-200',
        darkBg: 'dark:bg-yellow-700',
        text: 'text-yellow-700',
        darkText: 'dark:text-white'
      },
      hover: {
        light: 'hover:bg-yellow-100',
        dark: 'dark:hover:bg-yellow-900/30'
      }
    }
  };
  
  const colors = themeColors[userRole];
  
  // Navigation links based on user role
  const navLinks = userRole === 'author' 
    ? [
        { to: '/AuthorHandling', label: 'Dashboard', icon: User },
        { to: '/AuthorHandling/view-books', label: 'My Books', icon: BookOpen },
        { to: '/AuthorHandling/add-book', label: 'Add Book', icon: Book },
        { to: '/write-book', label: 'Write Book', icon: PenTool },
        { to: '/my-drafts', label: 'My Drafts', icon: Book }
      ]
    : [
        { to: '/CustomerHandling', label: 'Dashboard', icon: User },
        { to: '/CustomerHandling/books', label: 'Browse Books', icon: BookOpen },
        { to: '/CustomerHandling/favorites', label: 'Favorites', icon: Bell },
        { to: '/write-book', label: 'Write Book', icon: PenTool },
        { to: '/my-drafts', label: 'My Drafts', icon: Book }
      ];
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md shadow-lg' : `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} ${colors.darkGradientFrom} ${colors.darkGradientTo}`}`}>
      {/* Banner at the top */}
      <div className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} ${colors.darkGradientFrom} ${colors.darkGradientTo} py-1.5 px-4 text-white text-center text-sm font-medium`}>
        <span className="hidden sm:inline">
          {userRole === 'author' 
            ? 'Author Portal — Create and manage your literary masterpieces' 
            : 'Welcome to NovelistanAI — Where every page is a new adventure'}
        </span>
        <span className="sm:hidden">
          {userRole === 'author' ? 'Author Portal' : 'Welcome to NovelistanAI'}
        </span>
      </div>
      
      {/* Main Header */}
      <div className={`container mx-auto flex justify-between items-center py-3 px-6 transition-all ${isScrolled ? 'text-primary-800 dark:text-white' : 'text-white'}`}>
        {/* Left side on mobile - Menu button */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            className={`p-2 ${isScrolled ? `${colors.avatar.bg} ${colors.avatar.darkBg} ${colors.avatar.text} ${colors.avatar.darkText}` : 'bg-white/10 text-white'} rounded-lg hover:bg-opacity-80 transition-colors active:scale-95`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Center - Logo for all screens */}
        <div className="flex items-center mx-auto md:mx-0">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="relative">
              {userRole === 'author' 
                ? <PenTool className={`w-7 h-7 ${isScrolled ? `text-yellow-600 dark:text-yellow-400` : 'text-white drop-shadow-md'}`} />
                : <BookOpen className={`w-7 h-7 ${isScrolled ? `text-primary-600 dark:text-primary-400` : 'text-white drop-shadow-md'}`} />
              }
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-secondary-500 rounded-full border-2 border-white dark:border-secondary-800"></span>
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-wide ${isScrolled ? '' : 'drop-shadow-md'}`}>
                Novelistan<span className={`${colors.highlight} ${colors.darkHighlight}`}>AI</span>
                {userRole === 'author' && <span className="text-sm ml-1 font-normal">Author</span>}
              </h1>
            </div>
          </Link>
        </div>
        
        {/* Right side - User profile and dark mode toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3 mr-3">
            <button className={`p-2 rounded-full ${isScrolled ? `${colors.hover.light} ${colors.hover.dark}` : 'hover:bg-white/20'} transition-colors active:scale-95 relative`}>
              <Search className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-full ${isScrolled ? `${colors.hover.light} ${colors.hover.dark}` : 'hover:bg-white/20'} transition-colors active:scale-95 relative`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6 mr-4">
            {navLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className={`text-base font-medium transition-colors relative group ${isScrolled ? 
                  `hover:text-${userRole === 'author' ? 'yellow' : 'primary'}-600 dark:hover:text-${userRole === 'author' ? 'yellow' : 'primary'}-400` : 
                  'hover:text-white/80'}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 ${isScrolled ? 
                  `bg-${userRole === 'author' ? 'yellow' : 'primary'}-600 dark:bg-${userRole === 'author' ? 'yellow' : 'primary'}-400` : 
                  'bg-white'} scale-x-0 group-hover:scale-x-100 transition-transform`} />
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-full overflow-hidden border-2 ${isScrolled ? 'border-white dark:border-secondary-800' : 'border-white/70 dark:border-secondary-700/70'} shadow-md`}>
              <img 
                src={userImage} 
                alt={userName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = isDark 
                    ? (userRole === 'author' ? AUTHOR_DEFAULT_AVATAR_DARK : DEFAULT_AVATAR_DARK)
                    : (userRole === 'author' ? AUTHOR_DEFAULT_AVATAR : DEFAULT_AVATAR);
                }}
              />
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isScrolled ? `${colors.hover.light} ${colors.hover.dark}` : 'hover:bg-white/20'} transition-colors active:scale-95`}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`md:hidden fixed inset-x-0 top-[calc(4rem+1.75rem)] bg-white dark:bg-secondary-900 shadow-lg transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen border-t border-primary-100 dark:border-secondary-800' : 'max-h-0'}`}>
        <div className="container mx-auto p-4 space-y-5">
          {/* User Info */}
          <div className={`flex items-center gap-3 p-4 ${userRole === 'author' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-primary-50 dark:bg-secondary-800'} rounded-xl mb-4`}>
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary-200 dark:border-primary-700 shadow-md">
              <img 
                src={userImage} 
                alt={userName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = isDark 
                    ? (userRole === 'author' ? AUTHOR_DEFAULT_AVATAR_DARK : DEFAULT_AVATAR_DARK)
                    : (userRole === 'author' ? AUTHOR_DEFAULT_AVATAR : DEFAULT_AVATAR);
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-primary-800 dark:text-white">{userName}</div>
              <div className="text-sm text-primary-500 dark:text-primary-400">
                {userRole === 'author' ? 'Author' : 'Customer'}
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={index}
                  to={link.to} 
                  className={`flex items-center gap-3 px-4 py-3 text-primary-700 dark:text-white ${
                    userRole === 'author' 
                      ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                      : 'hover:bg-primary-50 dark:hover:bg-secondary-800'
                  } rounded-lg transition-colors`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={`${
                    userRole === 'author' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                      : 'bg-primary-100 dark:bg-secondary-700'
                  } p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${
                      userRole === 'author' 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-primary-600 dark:text-primary-400'
                    }`} />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {userRole === 'author' && (
              <Link 
                to="/creative-tools" 
                className="flex items-center gap-3 px-4 py-3 text-primary-700 dark:text-white hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                  <PenTool className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span>Creative Tools</span>
              </Link>
            )}
          </div>
          
          {/* Search */}
          <div className="mt-4 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 dark:text-primary-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder={userRole === 'author' ? "Search your books..." : "Search books..."} 
                className="w-full bg-primary-50 dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 rounded-lg py-3 pl-10 pr-4 text-primary-800 dark:text-white placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SharedHeader;
