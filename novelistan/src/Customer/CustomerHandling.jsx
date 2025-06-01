import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, useLocation, Link } from "react-router-dom";
import AddReview from './AddReview.jsx';
import ViewBooks from './ViewBooks';
import UserDeshboard from "./UserDeshboard";
import ReadingExperience from "./ReadingExperience";
import Cookies from 'js-cookie';
import { useTheme } from '../contexts/ThemeContext';
import { 
  BookOpen, 
  Home, 
  Star, 
  BookMarked, 
  Settings,
  Heart,
  Clock,
  LogOut,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User
} from 'lucide-react';
import Footer from "../components/Footer"; // Import Footer component
import SharedHeader from "../components/SharedHeader"; // Import shared header component

function CustomerHandling() {
    const { isDark, toggleDarkMode } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Get customer info from cookies (for displaying name)
    const customerId = Cookies.get('customerId');
    const customerName = Cookies.get('customerName') || 'Reader';
    
    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);
    
    // Debug function
    const checkCookies = () => {
        console.log("Checking cookies...");
        console.log(Cookies.get('customerId'));
    };

    
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 transition-colors duration-300">
            {/* Use SharedHeader component */}
            <SharedHeader userRole="customer" />
            
            {/* Mobile Navigation Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Navigation Menu */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-primary-700 dark:bg-secondary-800 shadow-xl z-50 transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary-200" />
                            <span className="text-lg font-bold text-white">NovelistanAI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={toggleDarkMode} 
                                className="p-2 rounded-lg bg-primary-600/30 dark:bg-secondary-700/30 text-white"
                                aria-label="Toggle dark mode"
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-secondary-800 rounded-xl mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-white font-semibold text-lg">
                            {customerName.charAt(0)}
                        </div>
                        <div>
                            <div className="font-semibold text-primary-800 dark:text-white">{customerName}</div>
                            <div className="text-sm text-primary-500 dark:text-primary-400">Customer</div>
                        </div>
                    </div>
                    
                    <nav className="flex-1 space-y-1">
                        <NavLink to="/CustomerHandling" end
                            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/books"
                            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <BookOpen className="w-5 h-5" />
                            <span>Books</span>
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/favorites"
                            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Heart className="w-5 h-5" />
                            <span>Favorites</span>
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/settings"
                            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </NavLink>
                    </nav>
                </div>
            </div>

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-16 bg-primary-700 dark:bg-secondary-800 shadow-lg z-30">
                <div className="flex flex-col items-center py-4 pt-28"> 
                    <nav className="flex flex-col items-center gap-4">
                        <NavLink to="/CustomerHandling" end
                            className={({isActive}) => `w-10 h-10 flex items-center justify-center rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Home className="w-5 h-5" />
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/books"
                            className={({isActive}) => `w-10 h-10 flex items-center justify-center rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <BookOpen className="w-5 h-5" />
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/favorites"
                            className={({isActive}) => `w-10 h-10 flex items-center justify-center rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Heart className="w-5 h-5" />
                        </NavLink>
                        
                        <NavLink to="/CustomerHandling/settings"
                            className={({isActive}) => `w-10 h-10 flex items-center justify-center rounded-lg ${isActive ? 'bg-primary-600/50 text-white' : 'text-primary-100 hover:bg-primary-600/30'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </NavLink>
                        
                        {/* Desktop sidebar dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-primary-100 hover:bg-primary-600/30 mt-4"
                            aria-label="Toggle dark mode"
                            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    </nav>
                </div>
            </div>
            
            {/* Main Content - Shifted for desktop sidebar and adjusted for fixed header */}
            <main className="md:ml-16 transition-all duration-300 min-h-screen pt-28 md:pt-24">
                <div className="container mx-auto px-4 py-6">
                    <Routes>
                        <Route path="/" element={<UserDeshboard />} />
                        <Route path="/add-review/:bookId" element={<AddReview />} />
                        <Route path="/books" element={<ViewBooks />} />
                        <Route path="/books/:bookId" element={<ViewBooks />} />
                        <Route path="/reading-experience" element={<ReadingExperience />} />
                        <Route path="/favorites" element={<div className="py-8"><h1 className="text-2xl font-bold mb-4 text-primary-800 dark:text-primary-300">Favorites</h1><p className="text-primary-600 dark:text-primary-500">Your favorite books will appear here.</p></div>} />
                        <Route path="/settings" element={<div className="py-8"><h1 className="text-2xl font-bold mb-4 text-primary-800 dark:text-primary-300">Settings</h1><p className="text-primary-600 dark:text-primary-500">User settings will appear here.</p></div>} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default CustomerHandling;
