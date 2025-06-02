// static-build.mjs - A simple static site generator that doesn't rely on Vite/Rollup
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const apiBaseUrl = process.env.VITE_API_BASE_URL || 'https://novelistan.onrender.com/api';

// Create a basic HTML file that redirects to the backend
function createStaticSite() {
  console.log('Starting static site generation...');
  
  try {
    // Clean dist directory if it exists
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('Cleaned existing dist directory');
    }
    
    // Create dist directory
    fs.mkdirSync(distDir, { recursive: true });
    console.log('Created dist directory');
    
    // Copy public directory if it exists
    if (fs.existsSync(publicDir)) {
      fs.mkdirSync(path.join(distDir, 'public'), { recursive: true });
      console.log('Created directory: ' + path.join(distDir, 'public'));
      
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        const srcPath = path.join(publicDir, file);
        const destPath = path.join(distDir, 'public', file);
        
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied ${srcPath} to ${destPath}`);
        }
      }
    }
    
    // Create a simple HTML file with links to the API
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novelistan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: #f8f9fa;
      color: #333;
    }
    header {
      background-color: #1a365d;
      color: white;
      padding: 2rem;
      text-align: center;
    }
    main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    h1 {
      margin-top: 0;
      font-size: 2.5rem;
    }
    h2 {
      color: #1a365d;
      margin-top: 0;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }
    .endpoint {
      background-color: #f1f5f9;
      border-radius: 4px;
      padding: 1rem;
      margin: 1rem 0;
    }
    .endpoint h3 {
      margin-top: 0;
      color: #2563eb;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-weight: 500;
      background-color: #dcfce7;
      color: #166534;
    }
    footer {
      background-color: #1a365d;
      color: white;
      text-align: center;
      padding: 1rem;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>Novelistan</h1>
    <p>A platform for authors and readers</p>
  </header>
  
  <main>
    <div class="card">
      <h2>API Status</h2>
      <p>
        <strong>Status:</strong> <span class="status">Running</span><br>
        <strong>Version:</strong> 1.0.0<br>
        <strong>Environment:</strong> production<br>
        <strong>Base URL:</strong> <a href="${apiBaseUrl}" target="_blank">${apiBaseUrl}</a>
      </p>
    </div>
    
    <div class="card">
      <h2>API Endpoints</h2>
      
      <div class="endpoint">
        <h3>/api/book</h3>
        <p>Book related operations</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/authors</h3>
        <p>Author operations</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/user</h3>
        <p>User management</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/reviews</h3>
        <p>Book reviews</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/customer</h3>
        <p>Customer operations</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/uploads</h3>
        <p>File upload operations</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/author-tools</h3>
        <p>Author tools and utilities</p>
      </div>
      
      <div class="endpoint">
        <h3>/api/reading</h3>
        <p>Reading experience operations</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Frontend Status</h2>
      <p>The frontend is currently being deployed separately. Please check back later or contact the administrator.</p>
    </div>
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} Novelistan. All rights reserved.</p>
  </footer>
</body>
</html>`;

    fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
    console.log('Created static index.html with redirect');
    
    // Create _redirects file for client-side routing
    fs.writeFileSync(path.join(distDir, '_redirects'), '/* /index.html 200');
    console.log('Created _redirects file');
    
    console.log('Static site generation completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating static site:', error);
    return false;
  }
}

// Run the build
createStaticSite();
