import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { FaBell, FaBookOpen, FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=ffe066&color=7d5a00&rounded=true&size=96";
const DEFAULT_AVATAR_DARK = "https://ui-avatars.com/api/?name=User&background=5f4d00&color=ffe066&rounded=true&size=96";

const UserHeader = ({ userImage, userName, loading }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New book recommendations available', isRead: false, time: '10 min ago' },
    { id: 2, text: 'Your review was liked by the author', isRead: false, time: '1 hour ago' },
    { id: 3, text: 'Weekly reading digest is ready', isRead: true, time: '1 day ago' }
  ]);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleReadNotification = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
    <>
    <header className="bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-700 dark:to-primary-900 text-white shadow-lg py-2 px-4 md:px-6 flex items-center justify-between transition-colors duration-300 sticky top-0 z-50">
      {/* Mobile Menu Button (visible on small screens) */}
      <button 
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-500 dark:hover:bg-primary-800 transition-colors duration-300"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Left Section: Logo/Title */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-primary-800 text-primary-600 dark:text-primary-300 font-bold text-lg mr-2 transition-colors duration-300">
            <FaBookOpen size={20} />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight">Novelistan<span className="text-yellow-300">AI</span></h1>
        </Link>
        
        {/* Navigation Links - Hidden on Mobile */}
        <nav className="hidden md:flex ml-6 space-x-4">
          <Link to="/dashboard" className="px-2 py-1 text-sm hover:text-yellow-200 transition-colors duration-300">Dashboard</Link>
          <Link to="/explore" className="px-2 py-1 text-sm hover:text-yellow-200 transition-colors duration-300">Explore</Link>
          <Link to="/library" className="px-2 py-1 text-sm hover:text-yellow-200 transition-colors duration-300">My Library</Link>
        </nav>
      </div>

      {/* Right Section: User Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="p-2 rounded-full hover:bg-primary-500 dark:hover:bg-primary-800 transition-colors duration-300 relative flex items-center justify-center"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Notifications"
          >
            <FaBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 text-gray-800 dark:text-white transition-all duration-300">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Notifications</h3>
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Mark all as read</button>
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${notification.isRead ? 'opacity-70' : 'font-medium'}`}
                      onClick={() => handleReadNotification(notification.id)}
                    >
                      <div className="text-sm">{notification.text}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No notifications
                </div>
              )}
              <div className="px-4 py-2 text-center border-t border-gray-200 dark:border-gray-700">
                <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-primary-500 dark:hover:bg-primary-800 transition-colors duration-300 hidden sm:flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-primary-800 dark:text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden sm:inline">Hi, {userName || 'User'}</span>
                <img
                  src={userImage || (isDark ? DEFAULT_AVATAR_DARK : DEFAULT_AVATAR)}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-primary-300 shadow-sm transition-colors duration-300 hover:ring-2 hover:ring-yellow-300"
                  onError={e => { e.target.onerror = null; e.target.src = isDark ? DEFAULT_AVATAR_DARK : DEFAULT_AVATAR; }}
                />
              </div>
            )}
          </button>
          
          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 text-gray-800 dark:text-white transition-all duration-300">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium">{userName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Member since 2023</p>
              </div>
              <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <FaUser size={14} />
                  <span>My Profile</span>
                </div>
              </Link>
              <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <FaCog size={14} />
                  <span>Settings</span>
                </div>
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <FaSignOutAlt size={14} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
    
    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300">
        <div className="bg-white dark:bg-gray-800 h-full w-4/5 max-w-xs shadow-xl p-4 transform transition-transform duration-300 overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 dark:bg-primary-700 text-white font-bold text-lg mr-2">
                <FaBookOpen size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Novelistan<span className="text-yellow-500">AI</span></h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className="mb-6 py-3 px-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={userImage || (isDark ? DEFAULT_AVATAR_DARK : DEFAULT_AVATAR)}
                alt="User Profile"
                className="w-12 h-12 rounded-full border-2 border-primary-400 dark:border-primary-600"
                onError={e => { e.target.onerror = null; e.target.src = isDark ? DEFAULT_AVATAR_DARK : DEFAULT_AVATAR; }}
              />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{userName || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Member since 2023</p>
              </div>
            </div>
            <div className="flex mt-3 justify-between">
              <Link 
                to="/profile" 
                className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center gap-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser size={12} />
                <span>Profile</span>
              </Link>
              <button 
                onClick={toggleTheme}
                className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center gap-1"
              >
                {isDark ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link 
              to="/dashboard"
              className="block py-2 px-4 text-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 rounded-md transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </div>
            </Link>
            <Link 
              to="/explore"
              className="block py-2 px-4 text-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 rounded-md transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Explore Books</span>
              </div>
            </Link>
            <Link 
              to="/library"
              className="block py-2 px-4 text-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 rounded-md transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>My Library</span>
              </div>
            </Link>
            <Link 
              to="/reading"
              className="block py-2 px-4 text-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 rounded-md transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Reading Experience</span>
              </div>
            </Link>
            <Link 
              to="/recommendations"
              className="block py-2 px-4 text-gray-800 dark:text-white hover:bg-primary-100 dark:hover:bg-primary-800 rounded-md transition-colors duration-200 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Recommendations</span>
              </div>
            </Link>
          </nav>
          
          {/* Notification Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-white flex items-center gap-2 mb-2">
              <FaBell size={14} className="text-primary-600 dark:text-primary-400" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-md">
              {notifications.length > 0 ? (
                notifications.slice(0, 2).map(notification => (
                  <div 
                    key={notification.id}
                    className={`px-3 py-2 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200 ${notification.isRead ? 'opacity-70' : 'font-medium'}`}
                    onClick={() => handleReadNotification(notification.id)}
                  >
                    <div className="text-sm text-gray-800 dark:text-white">{notification.text}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No notifications
                </div>
              )}
            </div>
            {notifications.length > 2 && (
              <button 
                className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline w-full text-center"
                onClick={() => {
                  setIsNotificationsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                View all {notifications.length} notifications
              </button>
            )}
          </div>
          
          {/* Logout Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2 px-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200 flex items-center justify-center gap-2">
              <FaSignOutAlt size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default UserHeader;

