import React, { useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Send } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const { isDark } = useTheme();

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-b from-primary-50 to-primary-100 dark:from-secondary-900 dark:to-secondary-800 text-secondary-800 dark:text-secondary-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Section */}
          <div>
            <h3 className="text-primary-700 dark:text-primary-400 font-bold text-lg mb-4">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  About us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Careers
                </a>
              </li>
              <li>
                <a href="/terms" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Terms
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          {/* Work With Us Section */}
          <div>
            <h3 className="text-primary-700 dark:text-primary-400 font-bold text-lg mb-4">WORK WITH US</h3>
            <ul className="space-y-2">
              <li>
                <a href="/authors" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Authors
                </a>
              </li>
              <li>
                <a href="/advertise" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Advertise
                </a>
              </li>
              <li>
                <a href="/blog" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  Author & Ads blog
                </a>
              </li>
              <li>
                <a href="/api" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Support Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-primary-700 dark:text-primary-400 font-bold text-lg mb-4">CONTACT</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-primary-700 dark:text-primary-400 font-bold text-lg mb-4">SUPPORT</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="/search-guide" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                    Search Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="text-primary-700 dark:text-primary-400 font-bold text-lg mb-4">NEWSLETTER</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">Subscribe to our newsletter for updates and exclusive content.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary-500 dark:bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-200 dark:border-secondary-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">Novelistan</h2>
              <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                Your ultimate platform for writers and readers
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/ios" className="inline-block">
                <img 
                  src="/app-store-badge.png" 
                  alt="Download on App Store" 
                  className="h-10 hover:opacity-80 transition-opacity"
                />
              </a>
              <a href="/android" className="inline-block">
                <img 
                  src="/play-store-badge.png" 
                  alt="Get it on Google Play" 
                  className="h-10 hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <p className="text-secondary-600 dark:text-secondary-400 text-sm">
            &copy; {currentYear} Novelistan. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;