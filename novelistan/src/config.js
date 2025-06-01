// Determine if we're running on a deployed site or locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Choose API URL based on environment
// Using environment variable if available, otherwise use local development URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isLocalhost ? 'http://localhost:8082' : 
   // Check if we're on Railway
   window.location.hostname.includes('railway.app') ? 
     // If on Railway, use the backend service URL
     'https://novelistan-backend-production.up.railway.app' : 
     // Fallback to Azure URL for backward compatibility
     'https://novelistanai.azurewebsites.net/');

// We support both Azure and Railway deployments
// Azure Frontend URL: https://polite-beach-0ccb55f0f.4.azurestaticapps.net
// Railway deployment will use Railway URLs

export default API_BASE_URL;