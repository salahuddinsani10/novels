const path = require('path');
const express = require('express');

// This function sets up the backend to serve the frontend static files
function setupFrontendServing(app) {
  // Path to the built frontend files
  const frontendBuildPath = path.join(__dirname, '../novelistan/dist');
  
  // Serve static files from the frontend build directory
  app.use(express.static(frontendBuildPath));
  
  // For any request that doesn't match an API route or static file,
  // serve the index.html file (client-side routing)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
  
  console.log('Frontend serving configured successfully');
}

module.exports = setupFrontendServing;
