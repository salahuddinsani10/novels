// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from "./pages/HomePage";
import NovelLandingPage from "./pages/NovelLandingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WriteBookPage from './pages/WriteBookPage';
import MyDraftsPage from './pages/MyDraftsPage';
import AuthorHandling from './Author/AuthorHandling';
import CustomerHandling from './Customer/CustomerHandling';
import NotFoundPage from './pages/NotFoundPage';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {


  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/landing" element={<NovelLandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/write-book" element={<WriteBookPage />} />
          <Route path="/my-drafts" element={<MyDraftsPage />} />
          <Route path="/AuthorHandling/*" element={<AuthorHandling />} />
          <Route path="/CustomerHandling/*" element={<CustomerHandling />} />
          <Route path="*" element={<NotFoundPage/>} /> {/* Fallback */}
        </Routes>
      </Router>
    </ThemeProvider>);
};

export default App;
