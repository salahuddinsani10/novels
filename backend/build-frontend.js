const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the frontend directory
const frontendPath = path.join(__dirname, '../novelistan');
const distPath = path.join(frontendPath, 'dist');

// Function to check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to create a directory if it doesn't exist
function ensureDir(dirPath) {
  if (!directoryExists(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to build the frontend
function buildFrontend() {
  console.log('===== FRONTEND BUILD PROCESS =====');
  console.log(`Frontend source directory: ${frontendPath}`);
  console.log(`Expected build output directory: ${distPath}`);
  
  // Check if frontend directory exists
  if (!directoryExists(frontendPath)) {
    console.error(`ERROR: Frontend directory not found at: ${frontendPath}`);
    console.error('This is a critical error. Cannot proceed with build.');
    process.exit(1);
  }
  
  try {
    // Navigate to frontend directory and run build commands
    const originalDir = process.cwd();
    console.log(`Changing directory to: ${frontendPath}`);
    process.chdir(frontendPath);
    
    console.log('\nStep 1/3: Installing frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\nStep 2/3: Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Verify the build output exists
    if (!directoryExists(distPath)) {
      console.error(`\nERROR: Build completed but dist directory not found at: ${distPath}`);
      console.error('This suggests the build process did not generate the expected output directory.');
      process.exit(1);
    }
    
    // List the build output files for verification
    console.log('\nStep 3/3: Verifying build output...');
    const buildFiles = fs.readdirSync(distPath);
    console.log(`Build output directory contains ${buildFiles.length} files/directories:`);
    buildFiles.forEach(file => console.log(` - ${file}`));
    
    console.log('\n✅ Frontend built successfully!');
    
    // Return to original directory
    console.log(`Returning to original directory: ${originalDir}`);
    process.chdir(originalDir);
  } catch (error) {
    console.error('\n❌ ERROR building frontend:', error.message);
    if (error.stdout) console.error('Process output:', error.stdout.toString());
    if (error.stderr) console.error('Process errors:', error.stderr.toString());
    process.exit(1);
  }
}

// Execute the build
buildFrontend();
