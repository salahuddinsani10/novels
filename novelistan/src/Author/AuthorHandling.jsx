import React from "react";
import { Routes, Route } from "react-router-dom";
import AddBook from "./AddBook";
import UpdateBook from "./UpdateBook";
import DeleteBook from "./DeleteBook";
import Dashboard from "./Dashboard";
import ViewBooks from "./ViewAuthorBooks";
import CreativeTools from "./CreativeTools";
import Footer from "../components/Footer";
import SharedHeader from "../components/SharedHeader";
import Cookies from 'js-cookie';
import { useTheme } from '../contexts/ThemeContext';


const AuthorHandling = () => {
    function checkCookies()
    {
        console.log(Cookies.get('authorId'))
    }
    
    const { isDark } = useTheme();
    
    return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Use SharedHeader with author role */}
      <SharedHeader userRole="author" />
      <main className="flex-grow container mx-auto px-4 py-6 mt-28">
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* Default route */}
          <Route path="add-book" element={<AddBook />} />
          <Route path="view-books" element={<ViewBooks />} />
          <Route path="update-book" element={<UpdateBook />} />
          <Route path="delete-book" element={<DeleteBook />} />
          <Route path="creative-tools/:bookId" element={<CreativeTools />} />
          <Route path="creative-tools" element={<CreativeTools />} />
        </Routes>
       
      </main>
      <button onClick={checkCookies} className="mx-auto mb-4 p-2 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg">Check Cookies</button>
      <Footer />
    </div>
  );
};

export default AuthorHandling;
