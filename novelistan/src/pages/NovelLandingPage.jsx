import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Book, Mail, LogIn, UserPlus, BookOpen, Star, Award, ArrowRight } from 'lucide-react';

// Landing Page Component
const NovelLandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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
            <Link to="/" className="flex items-center space-x-1 hover:text-yellow-800 dark:hover:text-yellow-200">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/about" className="flex items-center space-x-1 hover:text-yellow-800 dark:hover:text-yellow-200">
              <User className="h-5 w-5" />
              <span>About</span>
            </Link>
            <Link to="/contact" className="flex items-center space-x-1 hover:text-yellow-800 dark:hover:text-yellow-200">
              <Mail className="h-5 w-5" />
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
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link 
              to="/signup" 
              className="bg-black text-yellow-500 px-3 py-1.5 rounded-md flex items-center space-x-1 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600 text-sm"
            >
              <UserPlus className="h-4 w-4" />
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
            <Link to="/" className="flex items-center space-x-2 py-2 hover:text-yellow-800 dark:hover:text-yellow-200" onClick={() => setMobileNavOpen(false)}>
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/about" className="flex items-center space-x-2 py-2 hover:text-yellow-800 dark:hover:text-yellow-200" onClick={() => setMobileNavOpen(false)}>
              <User className="h-5 w-5" />
              <span>About</span>
            </Link>
            <Link to="/contact" className="flex items-center space-x-2 py-2 hover:text-yellow-800 dark:hover:text-yellow-200" onClick={() => setMobileNavOpen(false)}>
              <Mail className="h-5 w-5" />
              <span>Contact</span>
            </Link>
            <div className="flex flex-col gap-2 mt-4">
              <Link 
                to="/login" 
                className="bg-black text-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600"
                onClick={() => setMobileNavOpen(false)}
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link 
                to="/signup" 
                className="bg-black text-yellow-500 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-yellow-800 transition dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600"
                onClick={() => setMobileNavOpen(false)}
              >
                <UserPlus className="h-5 w-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Minimal, No Image */}
      <header className="pt-32 pb-16 md:py-36 container mx-auto px-4 flex flex-col items-center text-center">
        <div className="w-full max-w-3xl rounded-xl bg-yellow-100 dark:bg-gray-800 shadow-xl p-10 flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black dark:text-yellow-300 mb-3 text-center leading-tight">
            Welcome to Novelistan
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">Your ultimate destination for discovering, reading, and publishing captivating stories that inspire and entertain.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full xs:w-auto bg-black text-yellow-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-800 hover:text-white transition shadow-md dark:bg-gray-700 dark:text-yellow-200 dark:hover:bg-gray-600">
              Start Writing
            </button>
            <Link to="/signup" className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-8 py-4 rounded-lg text-white hover:from-yellow-700 hover:to-yellow-600 transition shadow-md dark:from-yellow-700 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-500 flex items-center justify-center transform hover:scale-105 duration-200">
              <span className="mr-2">Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Info Section: About the Platform (Text Only) */}
      <section className="container mx-auto mt-10 mb-8 px-2 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 flex flex-col gap-4">
          <div className="relative mb-4 transform -rotate-2">
            <h1 className="text-5xl md:text-7xl font-bold text-yellow-800 dark:text-yellow-300 drop-shadow-lg">Welcome to Novelistan</h1>
            <span className="absolute -top-2 -right-3 rotate-12 text-3xl">📚</span>
          </div>
          <p className="text-gray-700 dark:text-gray-400 mb-2">Novelistan is your gateway to a world of stories. Read, share, and connect with a vibrant community of readers and authors. Our AI-powered tools help you summarize, explore, and create stories like never before.</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
            <li>Personalized recommendations</li>
            <li>Instant AI book summaries</li>
            <li>Support for aspiring and established authors</li>
            <li>Community feedback and reviews</li>
          </ul>
        </div>
      </section>

      {/* Features Section - Expanded */}
      <section className="container mx-auto mt-16 grid md:grid-cols-4 gap-8">
        <div className="bg-yellow-100 dark:bg-gray-800 p-6 rounded-lg text-center shadow-md hover:scale-105 transition-transform">
          <div className="bg-yellow-100 dark:bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md">
            <BookOpen className="h-10 w-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold mb-2 dark:text-yellow-300">Create Novels</h3>
          <p className="text-gray-600 dark:text-gray-400">Write and publish your novels easily with our intuitive writing tools.</p>
        </div>
        <div className="bg-yellow-100 dark:bg-gray-800 p-6 rounded-lg text-center shadow-md hover:scale-105 transition-transform">
          <div className="bg-yellow-100 dark:bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md">
            <User className="h-10 w-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold mb-2 dark:text-yellow-300">Community</h3>
          <p className="text-gray-600 dark:text-gray-400">Connect with fellow writers and readers from around the world.</p>
        </div>
        <div className="bg-yellow-100 dark:bg-gray-800 p-6 rounded-lg text-center shadow-md hover:scale-105 transition-transform">
          <div className="bg-yellow-100 dark:bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md">
            <Star className="h-10 w-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold mb-2 dark:text-yellow-300">Feedback</h3>
          <p className="text-gray-600 dark:text-gray-400">Get constructive feedback and improve your writing skills.</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-yellow-300 dark:border-yellow-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 dark:bg-yellow-600 text-xs text-yellow-900 dark:text-black px-3 py-1 rounded-bl-lg font-bold">NEW</div>
          <div className="bg-yellow-100 dark:bg-gray-700 p-4 rounded-full inline-flex items-center justify-center mb-6 shadow-md">
            <Award className="h-10 w-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold mb-2 dark:text-yellow-300">AI Book Summarizer</h3>
          <p className="text-gray-600 dark:text-gray-400">Summarize any book or story instantly with our advanced AI technology. Save time & understand content quickly!</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-yellow-500 dark:bg-gray-800 text-yellow-900 dark:text-yellow-200 py-12 mt-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Book className="h-6 w-6 text-black dark:text-yellow-300" />
              <h3 className="text-xl font-bold dark:text-yellow-300">Novelistan</h3>
            </div>
            <p className="text-yellow-800 dark:text-yellow-200 opacity-90 mb-6">Your ultimate destination for discovering, reading, and publishing captivating stories that inspire and entertain.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4 text-yellow-900 dark:text-yellow-200">Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">Home</Link></li>
              <li><Link to="/about" className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">About</Link></li>
              <li><Link to="/contact" className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-lg mb-4 text-yellow-900 dark:text-yellow-200">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4 border-t border-yellow-400 dark:border-gray-700 pt-6 mt-6 text-center">
            <p>&copy; 2024 Novelistan. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Dark mode toggle as a component
const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const isDarkTheme = localStorage.getItem('theme') === 'dark' || (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'));
    setIsDark(isDarkTheme);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };
  return (
    <button
      onClick={toggleDarkMode}
      className="ml-2 p-2 rounded-full bg-yellow-200 dark:bg-gray-700 text-gray-900 dark:text-yellow-300 hover:bg-yellow-300 dark:hover:bg-yellow-600 transition-colors"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.485-8.485l-.707.707M4.222 4.222l-.707.707M21 12h1M3 12H2m15.364 6.364l-.707-.707M6.343 17.657l-.707-.707" /></svg>
      )}
    </button>
  );
};

export default NovelLandingPage;