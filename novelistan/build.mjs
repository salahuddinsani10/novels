// build.mjs - Static site generator for Azure Static Web Apps deployment
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFile(src, dest) {
  try {
    await fs.copyFile(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src}: ${err.message}`);
  }
}

async function build() {
  console.log('Starting static site generation...');
  
  try {
    // Clean dist directory
    await fs.rm(resolve(__dirname, 'dist'), { recursive: true, force: true })
      .catch(() => console.log('No dist directory to clean'));
    
    // Create dist directory
    await fs.mkdir(resolve(__dirname, 'dist'), { recursive: true });
    console.log('Created dist directory');
    
    // Create assets directory
    await fs.mkdir(resolve(__dirname, 'dist', 'assets'), { recursive: true });
    
    // Copy config files needed for deployment
    const filesToCopy = [
      // Copy public assets if they exist
      { src: resolve(__dirname, 'public'), dest: resolve(__dirname, 'dist', 'public') },
      // Copy staticwebapp.config.json for Azure Static Web Apps configuration
      { src: resolve(__dirname, 'staticwebapp.config.json'), dest: resolve(__dirname, 'dist', 'staticwebapp.config.json') },
    ];
    
    for (const file of filesToCopy) {
      try {
        // Check if source exists before copying
        await fs.access(file.src);
        
        const stat = await fs.stat(file.src);
        if (stat.isDirectory()) {
          await fs.mkdir(file.dest, { recursive: true });
          console.log(`Created directory: ${file.dest}`);
          
          // For directories, we'd need recursive copying (simplified version)
          // In a real implementation, you might want a more robust directory copy
          const files = await fs.readdir(file.src);
          for (const f of files) {
            await copyFile(resolve(file.src, f), resolve(file.dest, f));
          }
        } else {
          await copyFile(file.src, file.dest);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Skipping ${file.src} (does not exist)`);
        } else {
          console.error(`Error processing ${file.src}: ${err.message}`);
        }
      }
    }
    
    // Create index.html with link to deployed app
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0;url=https://polite-beach-0ccb55f0f.4.azurestaticapps.net" />
    <title>NovelistanAI</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
        color: #333;
        text-align: center;
      }
      .container {
        max-width: 800px;
        padding: 40px;
        margin: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      h1 {
        margin-bottom: 20px;
        font-size: 2.5rem;
        color: #0070f3;
      }
      p {
        margin-bottom: 20px;
        font-size: 1.2rem;
        line-height: 1.6;
      }
      .btn {
        display: inline-block;
        background-color: #0070f3;
        color: white;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 5px;
        font-weight: 500;
        transition: background-color 0.3s;
        margin: 10px;
      }
      .btn:hover {
        background-color: #0051a8;
      }
      .footer {
        margin-top: 40px;
        font-size: 0.9rem;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to NovelistanAI</h1>
      <p>Your AI-powered writing assistant</p>
      <p>Redirecting to the application...</p>
      <p>If you are not redirected automatically, <a href="https://polite-beach-0ccb55f0f.4.azurestaticapps.net">click here</a>.</p>
      
      <div class="footer">
        <p>Powered by Azure Static Web Apps</p>
      </div>
    </div>
  </body>
</html>`;
    
    await fs.writeFile(resolve(__dirname, 'dist', 'index.html'), indexHtml);
    console.log('Created static index.html with redirect');
    
    // Create a _redirects file for any hosting that supports it
    await fs.writeFile(
      resolve(__dirname, 'dist', '_redirects'),
      '/* https://polite-beach-0ccb55f0f.4.azurestaticapps.net/:splat 301!\n'
    );
    console.log('Created _redirects file');
    
    console.log('Static site generation completed successfully');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
