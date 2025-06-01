import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '', position = 'fixed' }) => {
  const { isDark, toggleDarkMode, isLoaded } = useTheme();

  if (!isLoaded) return null;

  const toggleButtonClass = `
    ${position === 'fixed' ? 'fixed top-4 right-4 z-50' : ''}
    ${className}
    bg-primary-100 dark:bg-secondary-800 
    text-primary-600 dark:text-primary-300 
    rounded-full p-3 shadow-lg 
    transition-all duration-300 
    hover:scale-110 
    focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-300
    active:scale-95
  `;

  return (
    <button
      onClick={toggleDarkMode}
      className={toggleButtonClass}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className="h-6 w-6" />
      ) : (
        <Sun className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
