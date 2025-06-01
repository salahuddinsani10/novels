// LoginPage.jsx
import React, { useState } from 'react';
import { LogIn, User, Lock, BookOpen, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';
import { useTheme } from '../contexts/ThemeContext';
import { useGoogleLogin } from '@react-oauth/google';

// SVG Components
const SocialIcon = ({ platform }) => {
  const icons = {
    google: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" fill="#1DA1F2"/>
      </svg>
    ),
  };

  return icons[platform] || null;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  
  // Google Login setup
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      if (!selectedRole) {
        setError('Please select a role first');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        // Get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );
        
        const userData = userInfoResponse.data;
        
        // Send the Google data to your backend
        let backendResponse;
        if (selectedRole === 'author') {
          backendResponse = await axios.post(`${API_BASE_URL}/api/authors/google-login`, {
            email: userData.email,
            name: userData.name,
            googleId: userData.sub,
            picture: userData.picture
          });
          
          if (backendResponse.data && backendResponse.data.token && backendResponse.data.author) {
            localStorage.setItem('token', backendResponse.data.token);
            localStorage.setItem('user', JSON.stringify({ 
              id: backendResponse.data.author, 
              role: 'author',
              name: userData.name,
              picture: userData.picture
            }));
            Cookies.set('authorId', backendResponse.data.author, { expires: 7 });
            Cookies.set('token', backendResponse.data.token, { expires: 7 });
            setSuccess(true);
            setTimeout(() => navigate('/AuthorHandling'), 1500);
          }
        } else if (selectedRole === 'customer') {
          backendResponse = await axios.post(`${API_BASE_URL}/api/customers/google-login`, {
            email: userData.email,
            name: userData.name,
            googleId: userData.sub,
            picture: userData.picture
          });
          
          if (backendResponse.data && backendResponse.data.token && backendResponse.data.customer) {
            localStorage.setItem('token', backendResponse.data.token);
            localStorage.setItem('user', JSON.stringify({ 
              id: backendResponse.data.customer, 
              role: 'customer',
              name: userData.name,
              picture: userData.picture
            }));
            Cookies.set('customerId', backendResponse.data.customer, { expires: 7 });
            Cookies.set('token', backendResponse.data.token, { expires: 7 });
            setSuccess(true);
            setTimeout(() => navigate('/CustomerHandling'), 1500);
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
        setError(error.response?.data?.message || 'Error logging in with Google');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed. Please try again.');
    },
  });

  // Real-time validation
  const emailValid = emailRegex.test(formData.email);
  const passwordValid = formData.password.length >= 6;
  const passwordStrength = formData.password.length > 10 ? 'Strong' : formData.password.length > 6 ? 'Medium' : 'Weak';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      let response;
      if (selectedRole === 'author') {
        response = await axios.post(`${API_BASE_URL}/api/authors/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (response.data && response.data.token && response.data.author) {
          // Store in both localStorage and Cookies
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify({ 
            id: response.data.author, 
            role: 'author' 
          }));
          Cookies.set('authorId', response.data.author, { expires: 7 });
          Cookies.set('token', response.data.token, { expires: 7 });
          setSuccess(true);
          setTimeout(() => navigate('/AuthorHandling'), 1500);
        }
      } else if (selectedRole === 'customer') {
        response = await axios.post(`${API_BASE_URL}/api/Customer/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (response.data && response.data.token && response.data.user) {
          // Store in both localStorage and Cookies
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify({ 
            id: response.data.user, 
            role: 'customer' 
          }));
          Cookies.set('customerId', response.data.user, { expires: 7 });
          Cookies.set('token', response.data.token, { expires: 7 });
          setSuccess(true);
          setTimeout(() => navigate('/CustomerHandling'), 1500);
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Request Config:', error.config);
      console.error('Response Data:', error.response?.data);
      setError(
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || JSON.stringify(error.response?.data) || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 dark:bg-gradient-to-br dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-300 dark:bg-primary-600 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400 dark:bg-primary-700 rounded-full opacity-10 translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-primary-500 dark:bg-primary-500 rounded-full opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-primary-600 dark:bg-primary-400 rounded-full opacity-20 animate-pulse-slow delay-1000"></div>
      
      <div className="w-full max-w-6xl flex items-center relative z-10">
        {/* Left side with login illustration */}
        <div className="hidden lg:block w-1/2 p-8">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            <img 
              src="https://cdni.iconscout.com/illustration/premium/thumb/login-page-4489364-3723270.png" 
              alt="Login Illustration" 
              className="w-full h-auto transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right side with form */}
        <div className="flex-1 lg:pl-6">
          <div className="bg-white dark:bg-secondary-800/90 backdrop-blur-sm rounded-xl shadow-lg p-5 relative max-w-sm mx-auto transform hover:scale-[1.02] transition-all duration-300 border border-primary-100 dark:border-secondary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-xl group overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-400 dark:bg-primary-600 rounded-full opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary-500 dark:bg-primary-700 rounded-full opacity-10"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" alt="Bookshelf" className="w-16 h-16 object-cover rounded-full shadow-md mb-2 border-2 border-primary-200 dark:border-primary-700" />
              <LogIn className="h-8 w-8 text-primary-500 dark:text-primary-400 drop-shadow-md" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-secondary-800 dark:text-primary-300 mb-1">Welcome Back</h1>
                <p className="text-secondary-600 dark:text-secondary-300 text-sm">Login to continue your journey</p>
              </div>

              {/* Role Selection */}
              <div className="mb-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => setSelectedRole('customer')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    selectedRole === 'customer'
                      ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-md'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Customer</span>
                </button>
                <button
                  onClick={() => setSelectedRole('author')}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                    selectedRole === 'author'
                      ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-md'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Author</span>
                </button>
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs text-center animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs text-center animate-fade-in">
                  Login successful! Redirecting...
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    aria-label="Email"
                    aria-invalid={!emailValid && touched.email}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => setTouched({ ...touched, email: true })}
                    placeholder="Enter Email"
                    className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-yellow-100 rounded-lg outline-none focus:ring-1 focus:ring-yellow-300 dark:focus:ring-yellow-600 transition-all duration-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 ${!emailValid && touched.email ? 'ring-1 ring-red-400 dark:ring-red-600' : ''}`}
                    required
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 group-hover:text-yellow-500 transition-colors" />
                  <div className="h-5 mt-1">
                    {touched.email && !emailValid && (
                      <span className="text-xs text-red-500 animate-fade-in">Please enter a valid email address.</span>
                    )}
                    {touched.email && emailValid && (
                      <span className="text-xs text-green-600 animate-fade-in">Looks good!</span>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      aria-label="Password"
                      aria-invalid={!passwordValid && touched.password}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      placeholder="Enter Password"
                      className={`w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-yellow-100 rounded-lg outline-none focus:ring-1 focus:ring-yellow-300 dark:focus:ring-yellow-600 transition-all duration-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 ${!passwordValid && touched.password ? 'ring-1 ring-red-400 dark:ring-red-600' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-500 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.956 9.956 0 012.929-7.071m2.121 2.121A7.963 7.963 0 0012 5c4.418 0 8 3.582 8 8a7.963 7.963 0 01-2.929 6.071M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.121-2.121A9.956 9.956 0 0121 12c0 5.523-4.477 10-10 10a9.956 9.956 0 01-7.071-2.929m2.121-2.121A7.963 7.963 0 0012 19c4.418 0 8-3.582 8-8a7.963 7.963 0 00-2.929-6.071" /></svg>
                      )}
                    </button>
                  </div>
                  <div className="h-5 mt-1">
                    {touched.password && !passwordValid && (
                      <span className="text-xs text-red-500 animate-fade-in">Password must be at least 6 characters.</span>
                    )}
                    {touched.password && passwordValid && (
                      <span className="text-xs text-green-600 animate-fade-in">Looks good!</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <a href="#" className="text-gray-600 hover:text-yellow-600 transition-colors text-xs">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                    !selectedRole
                      ? 'bg-gray-300 cursor-not-allowed disabled:transform-none'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                  disabled={!selectedRole || loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : 'Login'}
                </button>

                <div className="text-center mt-4">
                  <Link to="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors text-sm">
                    New user? Sign Up
                  </Link>
                </div>

                {/* Social Login */}
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Social logins temporarily unavailable</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                      Google login requires a valid OAuth client ID.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button 
                        type="button" 
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 cursor-not-allowed opacity-50"
                        disabled={true}
                      >
                        <SocialIcon platform="google" />
                      </button>
                      <button 
                        type="button" 
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 cursor-not-allowed opacity-50"
                        disabled={true}
                      >
                        <SocialIcon platform="facebook" />
                      </button>
                      <button 
                        type="button" 
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 cursor-not-allowed opacity-50"
                        disabled={true}
                      >
                        <SocialIcon platform="twitter" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;