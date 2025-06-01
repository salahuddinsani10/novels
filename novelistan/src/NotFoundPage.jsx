import React, { useState, useEffect } from 'react';  // Add this import
import { Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Added useNavigate for client-side routing

// Custom error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2 className="text-2xl text-red-500">Something went wrong</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const NotFoundPage = () => {
  const [glitchActive, setGlitchActive] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Using react-router-dom's useNavigate

  useEffect(() => {
    try {
      // Trigger glitch effect every few seconds
      const interval = setInterval(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }, 3000);

      // Cleanup function
      return () => clearInterval(interval);
    } catch (err) {
      setError(err);
      console.error('Animation error:', err);
    }
  }, []);

  // If there's an error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">An error occurred</h2>
          <p className="mb-4">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <h1 className={`text-8xl font-bold text-white mb-2 relative
              ${glitchActive ? 'animate-pulse' : ''}`}>
              404
            </h1>
            {glitchActive && (
              <>
                <h1 className="text-8xl font-bold text-red-500 absolute top-0 left-0 
                  animate-ping opacity-30">
                  404
                </h1>
                <h1 className="text-8xl font-bold text-blue-500 absolute top-0 left-0 
                  animate-ping opacity-30">
                  404
                </h1>
              </>
            )}
          </div>

          <pre className="text-gray-400 font-mono text-sm mb-8 hidden md:block">
            {`
     ,     ,
    (/-_-/)
    (  Y  )
    /\`---'\\
   /       \\
  /         \\
 /           \\
            `}
          </pre>

          <h2 className="text-2xl font-semibold text-gray-300 mb-4 animate-bounce">
            Oops! Page Not Found
          </h2>
          
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            The page you're looking for seems to have vanished into the digital void.
            Don't worry, you can find your way back home!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="inline-flex items-center px-6 py-3 bg-blue-600 
                text-white rounded-lg hover:bg-blue-700 transition-colors duration-200
                group"
              onClick={() => navigate('/')}  // Using useNavigate to go home
            >
              <Home className="mr-2 group-hover:animate-bounce" />
              Go Home
            </button>
            
            <button 
              className="inline-flex items-center px-6 py-3 bg-gray-700 
                text-white rounded-lg hover:bg-gray-600 transition-colors duration-200
                group"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 group-hover:animate-spin" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NotFoundPage;
