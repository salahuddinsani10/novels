import React, { useState } from 'react';
import { UserPlus, BookOpen, ShoppingCart, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useGoogleLogin } from '@react-oauth/google';

// Success card component to show after successful registration
const SuccessCard = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
      <div className="text-center relative z-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-200" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-yellow-100 mb-2">{message}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">You will be redirected to login page shortly.</p>
        <button
          onClick={onClose}
          className="bg-yellow-500 dark:bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

// SVG Components for social logins
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

const SignupPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    bio: '',
    dateOfBirth: '',
    securityCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, email: false, password: false });

  // Google Login setup
  const handleGoogleSignup = useGoogleLogin({
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
        
        // Create FormData for the request
        const data = new FormData();
        data.append('name', userData.name);
        data.append('email', userData.email);
        data.append('password', Math.random().toString(36).slice(-8)); // Generate random password
        data.append('role', selectedRole);
        data.append('googleId', userData.sub);
        
        // If user selected the author role, set an empty bio
        if (selectedRole === 'author') {
          data.append('bio', '');
        }
        
        // For profile picture, we'll use the Google profile picture
        // First, fetch the image
        const imageResponse = await fetch(userData.picture);
        const blob = await imageResponse.blob();
        const profilePicture = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        data.append('profilePicture', profilePicture);
        
        // Send the data to your backend
        const response = await axios.post(`${API_BASE_URL}/api/user/register`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data) {
          setShowSuccess(true);
          setTimeout(() => {
            handleSuccessClose();
          }, 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || error.response?.data || 'Registration with Google failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      setError('Google login failed: ' + error);
      setLoading(false);
    }
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate role
    if (!formData.role) {
      setError('Please select a role.');
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }
    if (!file) {
      setError('Please select a profile image.');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('role', formData.role);
      if (formData.role === 'author') {
        data.append('bio', formData.bio);
      }
      data.append('profilePicture', file);

      const response = await axios.post(`${API_BASE_URL}/api/user/register`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data) {
        setShowSuccess(true);
        setTimeout(() => {
          handleSuccessClose();
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data || 'Registration failed. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-yellow-300 dark:bg-yellow-500 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -right-12 w-64 h-64 bg-yellow-300 dark:bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-yellow-200 dark:bg-yellow-500 opacity-20 rounded-full blur-3xl"></div>
      
      {/* Main container with fixed height to prevent scrolling */}
      <div className="max-w-5xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <div className="md:flex h-[650px]">
          {/* Left Column - Illustrative Section */}
          <div className="md:w-5/12 bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-amber-700 p-6 md:p-10 flex flex-col items-start justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-6 left-6 w-20 h-20 border-2 border-white rounded-lg transform rotate-12"></div>
              <div className="absolute bottom-12 right-12 w-20 h-20 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/3 right-1/4 w-16 h-16 border-2 border-white rounded-lg transform -rotate-12"></div>
            </div>
            
            <div className="relative z-10 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Join Novelistan</h1>
              <p className="mb-6 text-white text-opacity-90">Create an account and embark on a literary journey with us.</p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Discover Stories</h3>
                    <p className="text-sm text-white text-opacity-80">Find your next favorite book</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Easy Purchase</h3>
                    <p className="text-sm text-white text-opacity-80">Quick and secure book buying</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Author Tools</h3>
                    <p className="text-sm text-white text-opacity-80">Publish and promote your works</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Form */}
          <div className="md:w-7/12 p-6 overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-yellow-50 mb-1">Create Your Account</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Fill in your details to get started</p>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedRole('customer');
                    setFormData({...formData, role: 'customer'});
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    formData.role === 'customer' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Customer
                </button>
                
                <button
                  onClick={() => {
                    setSelectedRole('author');
                    setFormData({...formData, role: 'author'});
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    formData.role === 'author' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Author
                </button>
              </div>
              {error && <div className="mt-2 text-red-500 dark:text-red-400 text-sm">{error}</div>}
            </div>
            
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Email field */}
                <div className="relative group col-span-2">
                  <label htmlFor="email" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="your@email.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    onBlur={() => setTouched({...touched, email: true})}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                    required 
                  />
                  {touched.email && !emailValid && (
                    <div className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fade-in">Please enter a valid email address.</div>
                  )}
                </div>
                
                {/* Password field */}
                <div className="relative group col-span-2">
                  <label htmlFor="password" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      name="password" 
                      placeholder="At least 6 characters" 
                      value={formData.password} 
                      onChange={handleChange} 
                      onBlur={() => setTouched({...touched, password: true})}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {touched.password && (
                    <span className={`absolute left-0 mt-1 text-xs ${passwordStrength === 'Strong' ? 'text-green-500' : 'text-yellow-600'} animate-fade-in`}>{passwordStrength}</span>
                  )}
                </div>
                
                {/* Name field */}
                <div className="relative group col-span-2">
                  <label htmlFor="name" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                    required 
                  />
                </div>
              </div>
              
              {/* Profile picture field - always visible */}
              <div className="relative group">
                <label htmlFor="profilePicture" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Profile Image</label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  accept="image/*"
                  required
                />
                {file && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-10 h-10 object-cover rounded-full border-2 border-yellow-300 shadow" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">Preview</span>
                  </div>
                )}
              </div>
              
              {/* Author bio field */}
              {formData.role === 'author' && (
                <div className="relative group">
                  <label htmlFor="bio" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Author Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="2"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                    required
                  ></textarea>
                </div>
              )}
              
              {/* Customer additional fields */}
              {formData.role === 'customer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <label htmlFor="dateOfBirth" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Date of Birth</label>
                    <input 
                      type="date" 
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                      required 
                    />
                  </div>
                  <div className="relative group">
                    <label htmlFor="securityCode" className="block text-gray-700 dark:text-yellow-200 font-medium mb-1 text-sm">Security Code</label>
                    <input 
                      type="text" 
                      id="securityCode"
                      name="securityCode"
                      value={formData.securityCode}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-300 group-hover:bg-gray-100 text-sm"
                      required 
                    />
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none mt-2"
                disabled={
                  !formData.role ||
                  !formData.name ||
                  !formData.email ||
                  !formData.password ||
                  !file ||
                  (formData.role === 'author' && !formData.bio) ||
                  loading
                }
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Create Account'}
              </button>
              
              {/* Social signup section */}
              <div className="mt-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-center gap-3">
                  <button 
                    type="button" 
                    onClick={handleGoogleSignup} 
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                    disabled={loading || !selectedRole}
                  >
                    <SocialIcon platform="google" />
                  </button>
                  <button 
                    type="button" 
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                    disabled={true}
                  >
                    <SocialIcon platform="facebook" />
                  </button>
                  <button 
                    type="button" 
                    className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-sm"
                    disabled={true}
                  >
                    <SocialIcon platform="twitter" />
                  </button>
                </div>
              </div>

              <div className="text-center mt-2">
                <Link to="/login" className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors text-sm">
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSuccess && (
        <SuccessCard
          message={`Successfully registered as ${selectedRole}!`}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
};

export default SignupPage;
