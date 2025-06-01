import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// To set up Google OAuth:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project
// 3. Go to "APIs & Services" > "Credentials"
// 4. Click "Create Credentials" > "OAuth client ID"
// 5. Select "Web application" as the application type
// 6. Add your domain to "Authorized JavaScript origins" (e.g., http://localhost:5173 for development)
// 7. Add your redirect URI to "Authorized redirect URIs" (e.g., http://localhost:5173 for development)
// 8. Copy the generated client ID and replace it below

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = '277994584649-7s97n1trbj6oi5eh91jcfokl0pf6g3bm.apps.googleusercontent.com' // This is a placeholder - replace with your own

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-yellow-100">
        <App />
      </div>
    </GoogleOAuthProvider>
  </StrictMode>,
)
