import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, BookOpen, Smile, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Cookies from 'js-cookie';
import API_BASE_URL from '../config';

const ReadingExperience = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('preferences');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState({
    favoriteGenres: [],
    readingLevel: 'intermediate',
    readingTimePerDay: 30,
    moodPreferences: []
  });
  const [readingPlan, setReadingPlan] = useState(null);
  const [currentMood, setCurrentMood] = useState('');
  const [moodRecommendations, setMoodRecommendations] = useState(null);
  
  const moods = [
    'happy', 'sad', 'adventurous', 'relaxed', 
    'inspired', 'curious', 'motivated', 'reflective'
  ];

  const readingLevels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const token = Cookies.get('token');
    console.log('Token present:', token ? 'Yes' : 'No');
    if (token) {
      fetchUserPreferences();
    } else {
      setError('You need to be logged in to use this feature');
    }
  }, []);

  const fetchUserPreferences = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      console.log('Using token for preferences:', token ? 'Present' : 'None');
      
      const response = await axios.get(`${API_BASE_URL}/api/reading/preferences`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setPreferences(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to fetch user preferences');
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = Cookies.get('token');
      console.log('Using token for updating preferences:', token ? 'Present' : 'None');
      
      const response = await axios.put(`${API_BASE_URL}/api/reading/preferences`, preferences, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setPreferences(response.data);
      setLoading(false);
      alert('Preferences updated successfully!');
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err.response?.data?.message || 'Failed to update preferences');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  const handleGenreChange = (genre) => {
    const updatedGenres = [...preferences.favoriteGenres];
    if (updatedGenres.includes(genre)) {
      const index = updatedGenres.indexOf(genre);
      updatedGenres.splice(index, 1);
    } else {
      updatedGenres.push(genre);
    }
    setPreferences({
      ...preferences,
      favoriteGenres: updatedGenres
    });
  };

  const handleMoodPrefChange = (mood) => {
    const updatedMoods = [...preferences.moodPreferences];
    if (updatedMoods.includes(mood)) {
      const index = updatedMoods.indexOf(mood);
      updatedMoods.splice(index, 1);
    } else {
      updatedMoods.push(mood);
    }
    setPreferences({
      ...preferences,
      moodPreferences: updatedMoods
    });
  };

  const generateReadingPlan = async () => {
    try {
      setLoading(true);
      setReadingPlan(null);
      const token = Cookies.get('token');
      console.log('Using token for reading plan:', token ? 'Present' : 'None');
      
      const response = await axios.get(`${API_BASE_URL}/api/reading/plan`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setReadingPlan(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error generating reading plan:', err);
      setError(err.response?.data?.message || 'Failed to generate reading plan');
      setLoading(false);
    }
  };

  const getMoodRecommendations = async () => {
    if (!currentMood) {
      alert('Please select a mood first');
      return;
    }
    
    try {
      setLoading(true);
      setMoodRecommendations(null);
      const token = Cookies.get('token');
      console.log('Using token for mood recommendations:', token ? 'Present' : 'None');
      
      const response = await axios.get(`${API_BASE_URL}/api/reading/mood-recommendations?mood=${currentMood}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setMoodRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error getting mood recommendations:', err);
      setError(err.response?.data?.message || 'Failed to get mood-based recommendations');
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Reading Preferences</h3>
            <form onSubmit={handleUpdatePreferences}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Reading Level</label>
                <select
                  name="readingLevel"
                  value={preferences.readingLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                >
                  {readingLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Reading Time Per Day (minutes)
                </label>
                <input
                  type="number"
                  name="readingTimePerDay"
                  value={preferences.readingTimePerDay}
                  onChange={handleInputChange}
                  min="5"
                  max="240"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Favorite Genres</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Horror', 'Thriller', 'Historical', 'Biography', 'Self-Help', 'Business'].map(genre => (
                    <div key={genre} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`genre-${genre}`}
                        checked={preferences.favoriteGenres.includes(genre)}
                        onChange={() => handleGenreChange(genre)}
                        className="mr-2"
                      />
                      <label htmlFor={`genre-${genre}`} className="text-gray-700 dark:text-gray-300">
                        {genre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Mood Preferences</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {moods.map(mood => (
                    <div key={mood} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mood-${mood}`}
                        checked={preferences.moodPreferences.includes(mood)}
                        onChange={() => handleMoodPrefChange(mood)}
                        className="mr-2"
                      />
                      <label htmlFor={`mood-${mood}`} className="text-gray-700 dark:text-gray-300">
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        );
      
      case 'plan':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Personalized Reading Plan</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Get a customized reading plan based on your preferences and reading history.
            </p>
            
            <button
              onClick={generateReadingPlan}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg mb-6"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Reading Plan'}
            </button>
            
            {readingPlan && (
              <div className="mt-4">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Your Plan</h4>
                  <div className="bg-gray-50 dark:bg-secondary-900 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {readingPlan.plan}
                  </div>
                </div>
                
                {readingPlan.currentBooks?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Current Books</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {readingPlan.currentBooks.map(book => (
                        <div key={book.id} className="bg-gray-50 dark:bg-secondary-900 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-800 dark:text-gray-200">{book.name}</h5>
                          <p className="text-gray-600 dark:text-gray-400">{book.genre}</p>
                          <div className="mt-2 bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ width: `${book.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {book.progress}% complete
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'mood':
        return (
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Mood-Based Recommendations</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Get book recommendations based on your current mood.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">How are you feeling today?</label>
              <select
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white mb-4"
              >
                <option value="">Select a mood...</option>
                {moods.map(mood => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={getMoodRecommendations}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-500 dark:hover:to-primary-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                disabled={loading || !currentMood}
              >
                {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
              </button>
            </div>
            
            {moodRecommendations && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Books for when you're feeling {moodRecommendations.mood}
                </h4>
                <div className="bg-gray-50 dark:bg-secondary-900 p-4 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {moodRecommendations.recommendations}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && !preferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Personalized Reading Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your reading journey and get AI-powered recommendations.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Reading Tools</h3>
            <ul>
              <li className="mb-2">
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'preferences'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Settings className="mr-2" size={16} />
                  Preferences
                </button>
              </li>
              <li className="mb-2">
                <button
                  onClick={() => setActiveTab('plan')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'plan'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Clock className="mr-2" size={16} />
                  Reading Plan
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('mood')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                    activeTab === 'mood'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Smile className="mr-2" size={16} />
                  Mood-Based Picks
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ReadingExperience;
