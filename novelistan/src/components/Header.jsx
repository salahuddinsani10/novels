import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Menu, X, User, Bell, Search, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [customerName, setCustomerName] = useState('Reader');
  const { isDark } = useTheme();
  
  // Get customer name from cookies
  useEffect(() => {
    const name = Cookies.get('customerName');
    if (name) setCustomerName(name);
  }, []);
  
  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      {/* Banner at the top */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-800 py-1 px-4 text-white text-center text-sm font-medium">
        <span className="hidden sm:inline">Welcome to NovelistanAI — Where every page is a new adventure</span>
        <span className="sm:hidden">Welcome to NovelistanAI</span>
      </div>
      
      {/* Main Header */}
      <nav className={`container mx-auto flex justify-between items-center py-4 px-6 transition-all ${isScrolled ? 'text-primary-800 dark:text-white' : 'text-white'}`}>
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="relative">
            <BookOpen className={`w-8 h-8 ${isScrolled ? 'text-primary-600 dark:text-primary-400' : 'text-white drop-shadow-md'}`} />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-white dark:border-secondary-800"></span>
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-wide hidden md:block ${isScrolled ? '' : 'drop-shadow-md'}`}>
              Novelistan<span className="text-primary-400 dark:text-primary-400">AI</span>
            </h1>
            <h1 className={`text-xl font-bold tracking-wide md:hidden ${isScrolled ? '' : 'drop-shadow-md'}`}>Novelistan<span className="text-primary-400 dark:text-primary-400">AI</span></h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-base font-medium transition-colors relative group py-6 ${isScrolled ? 'hover:text-primary-600 dark:hover:text-primary-400' : 'hover:text-white/80'}`}
            >
              Dashboard
              <span className={`absolute bottom-4 left-0 w-full h-0.5 ${isScrolled ? 'bg-primary-600 dark:bg-primary-400' : 'bg-white'} scale-x-0 group-hover:scale-x-100 transition-transform`} />
            </Link>
            <Link 
              to="/books" 
              className={`text-base font-medium transition-colors relative group py-6 ${isScrolled ? 'hover:text-primary-600 dark:hover:text-primary-400' : 'hover:text-white/80'}`}
            >
              Browse Books
              <span className={`absolute bottom-4 left-0 w-full h-0.5 ${isScrolled ? 'bg-primary-600 dark:bg-primary-400' : 'bg-white'} scale-x-0 group-hover:scale-x-100 transition-transform`} />
            </Link>
            <Link 
              to="/favorites" 
              className={`text-base font-medium transition-colors relative group py-6 ${isScrolled ? 'hover:text-primary-600 dark:hover:text-primary-400' : 'hover:text-white/80'}`}
            >
              Favorites
              <span className={`absolute bottom-4 left-0 w-full h-0.5 ${isScrolled ? 'bg-primary-600 dark:bg-primary-400' : 'bg-white'} scale-x-0 group-hover:scale-x-100 transition-transform`} />
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button className={`p-2 rounded-full ${isScrolled ? 'hover:bg-primary-100 dark:hover:bg-secondary-700' : 'hover:bg-white/20'} transition-colors active:scale-95 relative`}>
              <Search className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-full ${isScrolled ? 'hover:bg-primary-100 dark:hover:bg-secondary-700' : 'hover:bg-white/20'} transition-colors active:scale-95 relative`}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20 dark:border-white/10">
              <div className={`h-9 w-9 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center ${isScrolled ? 'text-primary-700 dark:text-white' : 'text-primary-700'} font-semibold`}>
                {customerName.charAt(0)}
              </div>
              <span className="font-medium hidden lg:block">{customerName}</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button & User Profile */}
        <div className="md:hidden flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-white font-semibold border-2 border-white/50 dark:border-secondary-700/50">
            {customerName.charAt(0)}
          </div>
          <button 
            className={`p-2 ${isScrolled ? 'hover:bg-primary-100 dark:hover:bg-secondary-700' : 'hover:bg-white/20'} rounded-lg transition-colors active:scale-95`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`md:hidden fixed inset-x-0 top-[calc(4rem+1.75rem)] bg-white dark:bg-secondary-900 shadow-lg transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen border-t border-primary-100 dark:border-secondary-800' : 'max-h-0'}`}>
        <div className="container mx-auto p-4 space-y-5">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-secondary-800 rounded-xl mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-white font-semibold text-lg">
              {customerName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-primary-800 dark:text-white">{customerName}</div>
              <div className="text-sm text-primary-500 dark:text-primary-400">Customer</div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="bg-primary-100 dark:bg-secondary-700 p-2 rounded-lg">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/books" 
              className="flex items-center gap-3 px-4 py-3 text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="bg-primary-100 dark:bg-secondary-700 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span>Browse Books</span>
            </Link>
            <Link 
              to="/favorites" 
              className="flex items-center gap-3 px-4 py-3 text-primary-700 dark:text-white hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="bg-primary-100 dark:bg-secondary-700 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <span>Favorites</span>
            </Link>
          </div>
          
          {/* Search */}
          <div className="mt-4 px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400 dark:text-primary-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search books..." 
                className="w-full bg-primary-50 dark:bg-secondary-800 border border-primary-200 dark:border-secondary-700 rounded-lg py-3 pl-10 pr-4 text-primary-800 dark:text-white placeholder-primary-400 dark:placeholder-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;