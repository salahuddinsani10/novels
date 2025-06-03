// Load environment variables
require('dotenv').config();

// ======================
// 1. Imports & Configuration
// ======================

// Core modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

// Import routes
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const authorToolsRoutes = require('./routes/authorToolsRoutes');
const readingExperienceRoutes = require('./routes/readingExperienceRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const customerRoutes = require('./routes/customerRoutes');

// Initialize Express app
const app = express();

// Environment configuration
const PORT = process.env.PORT || 8082;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/novelistan';

// ======================
// 2. Middleware
// ======================

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://novelistanai.azurewebsites.net', // Your Azure backend URL
      'http://localhost:3000',                  // Local development URL
      'http://localhost:5173',                  // Vite dev server
      'https://novelistanai-backend-deployment-gkhae2hca5acf4b5.canadacentral-01.azurewebsites.net', // Azure backend URL
      'https://polite-beach-0ccb55f0f.4.azurestaticapps.net' ,
      'https://novelistan-frontend.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Request received`, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });
  next();
});

// ======================
// 3. Directory Setup & File Handling
// ======================

// Create necessary directories if they don't exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    logger.info(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Ensure all upload directories exist
ensureDir(path.join(__dirname, 'uploads'));
ensureDir(path.join(__dirname, 'uploads', 'books'));
ensureDir(path.join(__dirname, 'uploads', 'covers'));
ensureDir(path.join(__dirname, 'uploads', 'profiles'));
ensureDir(path.join(__dirname, 'public'));

// Serve static files from upload directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Need to import axios for HTTP requests
const axios = require('axios');

// File serving route for both local files and Azure storage
app.get('/api/files/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const localPath = path.join(__dirname, 'uploads', type, filename);
    
    logger.debug('File request received', {
      type,
      filename,
      localPath
    });
    
    // Check if the file exists locally
    if (fs.existsSync(localPath)) {
      logger.info(`Serving local file`, { path: localPath });
      return res.sendFile(localPath);
    }
    
    // If file not found locally, try to get from Azure
    // The URL format in Azure is different depending on the file type
    let azureUrl;
    
    // Construct the correct URL based on the file type
    if (type === 'profiles') {
      azureUrl = `https://novelistanupload.blob.core.windows.net/uploads/profiles-${filename}`;
    } else if (type === 'books') {
      azureUrl = `https://novelistanupload.blob.core.windows.net/uploads/books-${filename}`;
    } else if (type === 'covers') {
      azureUrl = `https://novelistanupload.blob.core.windows.net/uploads/covers-${filename}`;
    } else {
      // For any other type, use a general format
      azureUrl = `https://novelistanupload.blob.core.windows.net/uploads/${type}-${filename}`;
    }
    
    logger.info('Fetching file from Azure', { type, filename, azureUrl });
    
    // Instead of redirecting, we'll proxy the request to Azure
    try {
      // Get the file from Azure with axios
      const response = await axios({
        method: 'get',
        url: azureUrl,
        responseType: 'stream'
      });
      
      // Set the appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      }
      
      // Pipe the file stream directly to the response
      logger.info('Successfully fetched file from Azure', { type, filename });
      return response.data.pipe(res);
    } catch (azureError) {
      logger.error('Failed to fetch file from Azure', { 
        error: azureError.message,
        url: azureUrl,
        type,
        filename
      });
      return res.status(404).json({ message: 'File not found in Azure storage' });
    }
  } catch (error) {
    logger.error('File proxy error', {
      params: req.params,
      error: error.message,
      stack: error.stack
    });
    return res.status(404).json({ message: 'File not found' });
  }
});

// ======================
// 4. Database Connection
// ======================

const connectDB = async () => {
  logger.startup('MongoDB', 'Connecting', {
    uri: MONGODB_URI.replace(/\/\/(.+?)@/, '//[REDACTED]@'), // Redact credentials
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  });
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.startup('MongoDB', 'Connected successfully');
  } catch (error) {
    logger.critical('MongoDB connection failed', {
      errorName: error.name,
      errorCode: error.code || 'unknown',
      hosts: error.message?.includes('failed to connect') ? error.message.match(/connect to ([^:]+)/)?.[1] : 'unknown'
    }, error);
    
    // Don't exit immediately in production to allow for error logging
    if (process.env.NODE_ENV === 'production') {
      logger.critical('Server cannot start without database', {
        action: 'Delayed process exit (5s)'
      });
      setTimeout(() => process.exit(1), 5000); // Give logs time to flush
    } else {
      process.exit(1);
    }
  }
};

// ======================
// 5. API Routes
// ======================

// Root route - redirect to frontend URL in production or show API status
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, we'll serve a simple page with links to API documentation
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novelistan</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
          }
          .card {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .api-link {
            display: block;
            margin: 10px 0;
            padding: 10px;
            background: #e7f5ff;
            border-radius: 4px;
            color: #0366d6;
            text-decoration: none;
          }
          .api-link:hover {
            background: #dbeeff;
          }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            background: #d4edda;
            color: #155724;
          }
        </style>
      </head>
      <body>
        <h1>Novelistan API</h1>
        <div class="card">
          <p>Status: <span class="status">Running</span></p>
          <p>Version: 1.0.0</p>
          <p>Environment: ${process.env.NODE_ENV}</p>
        </div>
        
        <h2>API Endpoints</h2>
        <a href="/api/book" class="api-link">/api/book - Book related operations</a>
        <a href="/api/authors" class="api-link">/api/authors - Author operations</a>
        <a href="/api/user" class="api-link">/api/user - User management</a>
        <a href="/api/reviews" class="api-link">/api/reviews - Book reviews</a>
        
        <div class="card">
          <h3>Note</h3>
          <p>This is the API server for Novelistan. The frontend application should be deployed separately.</p>
          <p>For more information, please refer to the project documentation.</p>
        </div>
      </body>
      </html>
    `);
  } else {
    // In development, just show API status
    res.json({
      success: true,
      message: "API is running",
      version: "1.0.0"
    });
  }
});

// API Routes
app.use('/api/book', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/author-tools', authorToolsRoutes);
app.use('/api/reading', readingExperienceRoutes);

// ======================
// 6. Health Check Routes
// ======================

// Health Check Routes

// Root route for API health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running', 
    version: '1.0.0' 
  });
});

// getMessage route
app.get('/getMessage', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running...' 
  });
});

// ======================
// 8. Frontend Serving
// ======================

// ======================
// 6. Health Check Routes
// ======================

// Root route for API health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running', 
    version: '1.0.0' 
  });
});

// getMessage route
app.get('/getMessage', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API is running...' 
  });
});

// ======================
// 7. Error Handling
// ======================

// Global error handler - must be after all other middleware and routes
app.use((err, req, res, next) => {
  logger.error('Unhandled server error:', { 
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

// Process event handlers
process.on('unhandledRejection', (err) => {
  logger.critical('Unhandled Promise Rejection', {
    errorName: err.name,
    stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
  }, err);
  
  // In production, don't exit the process as it would crash the server
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.critical('Uncaught Exception', {
    errorName: err.name,
    stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
  }, err);
  
  // In production we might want to attempt to gracefully shut down
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// ======================
// 8. Frontend Serving
// ======================

// NOTE: We're now using a direct approach with a styled HTML page at the root route
// instead of serving the full React frontend from the backend.
// This simplifies deployment and reduces build complexity.

// // In production, serve the frontend from the backend
// if (process.env.NODE_ENV === 'production') {
//   const setupFrontendServing = require('./serve-frontend');
//   setupFrontendServing(app);
//   logger.info('Frontend serving enabled in production mode');
// }

// ======================
// 9. Start Server
// ======================

const startServer = async () => {
  try {
    // Log system information for diagnostics
    logger.startup('System', 'Starting', {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT
    });
    
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      logger.startup('Server', 'Started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        uptime: process.uptime()
      });
      
      logger.info('Server startup complete');
    });
    
  } catch (error) {
    logger.critical('Server startup failed', { 
      phase: 'initialization'
    }, error);
    
    // Don't exit immediately in production to allow for error logging
    if (process.env.NODE_ENV === 'production') {
      logger.critical('Server failed to start', {
        action: 'Delayed process exit (5s)'
      });
      setTimeout(() => process.exit(1), 5000); // Give logs time to flush
    } else {
      process.exit(1);
    }
  }
};

// Process event handlers
process.on('unhandledRejection', (err) => {
  logger.critical('Unhandled Promise Rejection', {
    errorName: err.name,
    stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
  }, err);
  
  // In production, don't exit the process as it would crash the server
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  logger.critical('Uncaught Exception', {
    errorName: err.name,
    stack: err.stack ? err.stack.split('\n').slice(0, 3).join('\n') : 'No stack trace'
  }, err);
  
  // In production, give time for logs to be written before exiting
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => process.exit(1), 3000);
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Close any open connections, etc.
  process.exit(0);
});

// ======================
// Start the server
// ======================
startServer();