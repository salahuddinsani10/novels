// Determine if we're running on a deployed site or locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Choose API URL based on environment
// Using environment variable if available, otherwise use local development URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isLocalhost ? 'http://localhost:8082' : 'https://novelistanai.azurewebsites.net/');

// We are now exclusively deploying to Azure Static Web Apps
// Frontend URL: https://polite-beach-0ccb55f0f.4.azurestaticapps.net

export default API_BASE_URL;