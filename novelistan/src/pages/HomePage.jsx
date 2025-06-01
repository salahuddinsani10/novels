import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, BookOpen, Star, Award, ArrowRight, ChevronRight, Users, Bookmark, TrendingUp } from 'lucide-react';
import Footer from '../components/Footer';
import { useTheme } from '../contexts/ThemeContext';

// Dark mode toggle component
const DarkModeToggle = () => {
  const { isDark, toggleDarkMode } = useTheme();
  
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full bg-yellow-400/20 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-400/30 dark:hover:bg-gray-600 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

const HomePage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark } = useTheme();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // No featured books data needed anymore

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 font-sans">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-yellow-500/95 dark:bg-gray-800/95 shadow-lg' : 'bg-yellow-500 dark:bg-gray-800'} text-yellow-900 dark:text-yellow-200 p-4`}>
        <div className="container mx-auto flex justify-between items-center relative">
          <div className="flex items-center space-x-2">
            <Book className="h-8 w-8 text-black dark:text-yellow-300" />
            <h1 className="text-2xl font-bold dark:text-yellow-300">Novelistan</h1>
          </div>

          {/* Hamburger for mobile */}
          <button
            className="md:hidden flex items-center px-2 py-1 rounded hover:bg-yellow-400 focus:outline-none dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={() => setMobileNavOpen(o => !o)}
            aria-label="Open navigation menu"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="flex items-center space-x-1 font-bold border-b-2 border-black dark:border-yellow-300">
              <span>Home</span>
            </Link>
            <Link to="/about" className="flex items-center space-x-1 hover:text-yellow-800 dark:hover:text-yellow-200">
              <span>About</span>
            </Link>
            <Link to="/contact" className="flex items-center space-x-1 hover:text-yellow-800 dark:hover:text-yellow-200">
              <span>Contact</span>
            </Link>
          </div>
          <div className="flex space-x-4 items-center">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            <Link 
              to="/login" 
              className="bg-black text-yellow-500 px-3 py-1.5 rounded-md flex items-center space-x-1 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600 text-sm"
            >
              <span>Login</span>
            </Link>
            <Link 
              to="/signup" 
              className="bg-black text-yellow-500 px-3 py-1.5 rounded-md flex items-center space-x-1 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600 text-sm"
            >
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Nav Overlay */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileNavOpen(false)}></div>
          )}
          <div
            className={`fixed top-0 right-0 z-[999] h-full w-64 bg-yellow-100 dark:bg-gray-800 shadow-lg p-6 flex flex-col gap-4 transform md:hidden transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ minHeight: '100vh' }}
          >
            <button
              className="self-end mb-4 text-yellow-700 hover:text-black dark:text-yellow-200 dark:hover:text-yellow-300"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link to="/" className="flex items-center space-x-2 py-2 font-bold" onClick={() => setMobileNavOpen(false)}>
              <span>Home</span>
            </Link>
            <Link to="/about" className="flex items-center space-x-2 py-2 hover:text-yellow-800 dark:hover:text-yellow-200" onClick={() => setMobileNavOpen(false)}>
              <span>About</span>
            </Link>
            <Link to="/contact" className="flex items-center space-x-2 py-2 hover:text-yellow-800 dark:hover:text-yellow-200" onClick={() => setMobileNavOpen(false)}>
              <span>Contact</span>
            </Link>
            <div className="flex flex-col gap-2 mt-4">
              <Link 
                to="/login" 
                className="bg-black text-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600"
                onClick={() => setMobileNavOpen(false)}
              >
                <span>Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="bg-black text-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600"
                onClick={() => setMobileNavOpen(false)}
              >
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 md:py-36 container mx-auto px-4 flex flex-col items-center text-center">
        <div className="w-full max-w-3xl rounded-xl bg-yellow-100 dark:bg-gray-800 shadow-xl p-10 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black dark:text-yellow-300 mb-3 text-center leading-tight">
            Welcome to Novelistan
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">Your ultimate destination for discovering, reading, and publishing captivating stories that inspire and entertain.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/write-book" className="w-full sm:w-auto bg-black text-yellow-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-800 hover:text-white transition shadow-md dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600 flex items-center justify-center">
              <span className="mr-2">Start Writing</span>
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link to="/signup" className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-8 py-4 rounded-lg text-white hover:from-yellow-700 hover:to-yellow-600 transition shadow-md dark:from-yellow-700 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-500 flex items-center justify-center transform hover:scale-105 duration-200">
              <span className="mr-2">Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Write Book Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/20 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-2/3">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Writing Your Book Today</h2>
              <p className="text-yellow-100 text-lg mb-6">
                Unleash your creativity with our intuitive writing tools. Create captivating stories, format your text with ease, and share your masterpiece with readers around the world.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-1 mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Rich text editor with formatting options</span>
                </li>
                <li className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-1 mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Auto-save and cloud backup</span>
                </li>
                <li className="flex items-center text-white">
                  <div className="bg-white/20 rounded-full p-1 mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Publish and share with our community</span>
                </li>
              </ul>
              <Link to="/write-book" className="inline-flex items-center bg-white text-yellow-600 hover:bg-yellow-100 px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
                <span className="mr-2">Start Writing Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <BookOpen className="h-24 w-24 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-yellow-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-yellow-800 dark:text-yellow-300 text-center mb-12">Why Choose Novelistan</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Vast Library</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access thousands of books across various genres, from classics to contemporary bestsellers.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow readers and writers, share reviews, and participate in book discussions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">AI-Powered</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enjoy personalized recommendations and AI-generated summaries to enhance your reading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full -mt-20 -mr-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/20 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Reading Journey?</h2>
            <p className="text-yellow-100 text-lg mb-8">
              Join thousands of readers and writers on Novelistan today. Sign up for free and get access to our vast library of books and writing tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="bg-white text-yellow-600 hover:bg-yellow-100 px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl">
                Sign Up Now
              </Link>
              <Link to="/login" className="bg-yellow-800/30 hover:bg-yellow-800/50 text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl border border-yellow-200/30">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
