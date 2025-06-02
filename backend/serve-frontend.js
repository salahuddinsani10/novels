const path = require('path');
const express = require('express');
const fs = require('fs');

// This function sets up the backend to serve the frontend static files
function setupFrontendServing(app) {
  // Path to the built frontend files
  const frontendBuildPath = path.join(__dirname, '../novelistan/dist');
  
  // Check if the frontend build directory exists
  if (!fs.existsSync(frontendBuildPath)) {
    console.error(`Frontend build directory not found at: ${frontendBuildPath}`);
    console.error('Make sure the frontend is built before starting the server');
    
    // Create a fallback route for the root path
    app.get('/', (req, res) => {
      res.send(`
        <html>
          <head><title>Novelistan API</title></head>
          <body>
            <h1>Novelistan API is running</h1>
            <p>The API is running, but the frontend build files were not found.</p>
            <p>Please make sure the frontend is built properly during deployment.</p>
          </body>
        </html>
      `);
    });
    
    return;
  }
  
  // Serve static files from the frontend build directory
  app.use(express.static(frontendBuildPath));
  
  // For any request that doesn't match an API route or static file,
  // serve the index.html file (client-side routing)
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Send the index.html file
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
  
  console.log(`Frontend serving configured successfully from: ${frontendBuildPath}`);
}

module.exports = setupFrontendServing;
