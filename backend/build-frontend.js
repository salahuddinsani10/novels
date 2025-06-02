const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the frontend directory
const frontendPath = path.join(__dirname, '../novelistan');

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to build the frontend
function buildFrontend() {
  console.log('Building frontend...');
  
  // Check if frontend directory exists
  if (!directoryExists(frontendPath)) {
    console.error(`Frontend directory not found at: ${frontendPath}`);
    process.exit(1);
  }
  
  try {
    // Navigate to frontend directory and run build commands
    process.chdir(frontendPath);
    console.log('Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Frontend built successfully!');
    
    // Return to original directory
    process.chdir(__dirname);
  } catch (error) {
    console.error('Error building frontend:', error.message);
    process.exit(1);
  }
}

// Execute the build
buildFrontend();
