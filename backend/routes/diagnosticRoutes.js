/**
 * Diagnostic routes for NovelistanAI
 * These routes provide health checks and system diagnostics for troubleshooting
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { BlobServiceClient } = require('@azure/storage-blob');
const os = require('os');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Health check endpoint that tests all critical systems
router.get('/health', async (req, res) => {
  const healthReport = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    components: {},
    diagnostics: {}
  };

  // System information
  healthReport.diagnostics.system = {
    hostname: os.hostname(),
    platform: process.platform,
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpus: os.cpus().length
  };

  // Test MongoDB connection
  try {
    healthReport.components.database = { status: 'checking' };
    // Check if mongoose is connected
    if (mongoose.connection.readyState === 1) {
      healthReport.components.database = {
        status: 'connected',
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } else {
      throw new Error('MongoDB not connected');
    }
  } catch (error) {
    healthReport.status = 'degraded';
    healthReport.components.database = {
      status: 'error',
      error: error.message,
      readyState: mongoose.connection.readyState
    };
    logger.error('Health check - Database error', {}, error);
  }

  // Test Azure Blob Storage
  try {
    healthReport.components.azureStorage = { status: 'checking' };
    
    // Check if Azure Storage credentials are configured
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
    
    if (!accountName || !sasToken) {
      throw new Error('Azure Storage credentials missing');
    }
    
    // Try to create a blob service client
    const accountUrl = `https://${accountName}.blob.core.windows.net`;
    const blobServiceClient = new BlobServiceClient(`${accountUrl}?${sasToken}`);
    
    // Try to get container properties to verify access
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const properties = await containerClient.getProperties().catch(e => {
      throw new Error(`Container access error: ${e.message}`);
    });
    
    healthReport.components.azureStorage = {
      status: 'connected',
      accountName,
      containerName,
      sasTokenPresent: true,
      sasTokenLength: sasToken.length,
      sasTokenExpiry: sasToken.includes('se=') ? 
        sasToken.match(/se=([^&]+)/)?.[1] || 'unknown' : 'unknown'
    };
  } catch (error) {
    healthReport.status = 'degraded';
    healthReport.components.azureStorage = {
      status: 'error',
      error: error.message,
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'not set',
      sasTokenPresent: !!process.env.AZURE_STORAGE_SAS_TOKEN,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'not set'
    };
    logger.error('Health check - Azure Storage error', {}, error);
  }

  // Check if JWT_SECRET is configured
  healthReport.components.security = {
    status: process.env.JWT_SECRET ? 'configured' : 'error',
    jwtSecretPresent: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  };
  
  if (!process.env.JWT_SECRET) {
    healthReport.status = 'degraded';
    healthReport.components.security.error = 'JWT_SECRET not configured';
  }

  // Check file system access for upload directories
  try {
    healthReport.components.fileSystem = { status: 'checking' };
    
    const uploadDirs = [
      path.join(__dirname, '..', 'uploads'),
      path.join(__dirname, '..', 'uploads', 'books'),
      path.join(__dirname, '..', 'uploads', 'covers'),
      path.join(__dirname, '..', 'uploads', 'profiles')
    ];
    
    const dirResults = uploadDirs.map(dir => {
      let result = { path: dir, exists: false, writable: false };
      try {
        result.exists = fs.existsSync(dir);
        if (result.exists) {
          // Try to write a test file to verify write access
          const testFile = path.join(dir, '.health-check-test');
          fs.writeFileSync(testFile, 'test');
          fs.unlinkSync(testFile);
          result.writable = true;
        }
      } catch (err) {
        result.error = err.message;
      }
      return result;
    });
    
    healthReport.components.fileSystem = {
      status: dirResults.every(d => d.exists && d.writable) ? 'ok' : 'error',
      directories: dirResults
    };
    
    if (!dirResults.every(d => d.exists && d.writable)) {
      healthReport.status = 'degraded';
    }
  } catch (error) {
    healthReport.status = 'degraded';
    healthReport.components.fileSystem = {
      status: 'error',
      error: error.message
    };
    logger.error('Health check - File system error', {}, error);
  }

  // Set appropriate HTTP status code based on overall health
  const httpStatus = healthReport.status === 'ok' ? 200 : 
                     healthReport.status === 'degraded' ? 200 : 500;
                     
  // Log the health check result
  logger.info('Health check performed', {
    status: healthReport.status,
    clientIp: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(httpStatus).json(healthReport);
});

// Environment variables check (secure version)
router.get('/env', (req, res) => {
  // Only report presence of environment variables, not their values
  const envReport = {
    environment: process.env.NODE_ENV || 'development',
    variables: {
      // Server
      PORT: !!process.env.PORT,
      NODE_ENV: !!process.env.NODE_ENV,
      
      // Database
      MONGODB_URI: !!process.env.MONGODB_URI,
      
      // Azure Storage
      AZURE_STORAGE_ACCOUNT_NAME: !!process.env.AZURE_STORAGE_ACCOUNT_NAME,
      AZURE_STORAGE_ACCOUNT_KEY: !!process.env.AZURE_STORAGE_ACCOUNT_KEY,
      AZURE_STORAGE_CONTAINER_NAME: !!process.env.AZURE_STORAGE_CONTAINER_NAME,
      AZURE_STORAGE_SAS_TOKEN: !!process.env.AZURE_STORAGE_SAS_TOKEN,
      
      // Security
      JWT_SECRET: !!process.env.JWT_SECRET
    }
  };
  
  res.json(envReport);
});

// Test MongoDB connection
router.get('/db-test', async (req, res) => {
  try {
    // Check mongoose connection state
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    // Try to run a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      status: 'success',
      connection: {
        state: connectionStates[connectionState] || `unknown (${connectionState})`,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: collections.map(c => c.name)
      }
    });
  } catch (error) {
    logger.error('DB test failed', {}, error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      connectionState: mongoose.connection.readyState
    });
  }
});

// Test Azure Blob Storage
router.get('/azure-test', async (req, res) => {
  try {
    // Check if Azure Storage credentials are configured
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
    
    if (!accountName || !sasToken) {
      throw new Error('Azure Storage credentials missing');
    }
    
    // Create a blob service client
    const accountUrl = `https://${accountName}.blob.core.windows.net`;
    const blobServiceClient = new BlobServiceClient(`${accountUrl}?${sasToken}`);
    
    // Try to access the container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.getProperties();
    
    // List some blobs to verify access
    const blobs = [];
    let i = 0;
    for await (const blob of containerClient.listBlobsFlat({maxResults: 5})) {
      blobs.push({
        name: blob.name,
        contentLength: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        lastModified: blob.properties.lastModified
      });
      if (++i >= 5) break; // Only get the first 5 blobs
    }
    
    res.json({
      status: 'success',
      account: accountName,
      container: containerName,
      sasTokenExpiry: sasToken.includes('se=') ? 
        sasToken.match(/se=([^&]+)/)?.[1] || 'unknown' : 'unknown',
      blobs: blobs
    });
  } catch (error) {
    logger.error('Azure test failed', {}, error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || 'not set',
      sasTokenPresent: !!process.env.AZURE_STORAGE_SAS_TOKEN,
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'not set'
    });
  }
});

// Simple log viewer endpoint (TEMPORARY - REMOVE IN PRODUCTION)
router.get('/logs', (req, res) => {
  // Check for a simple password to prevent unauthorized access
  const providedKey = req.query.key;
  const expectedKey = 'novelistan-debug'; // Simple protection
  
  if (providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Create a simple in-memory log collector
    const logs = {
      environment: process.env.NODE_ENV || 'unknown',
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      envVarsPresent: {
        PORT: !!process.env.PORT,
        MONGODB_URI: !!process.env.MONGODB_URI,
        JWT_SECRET: !!process.env.JWT_SECRET,
        AZURE_STORAGE_ACCOUNT_NAME: !!process.env.AZURE_STORAGE_ACCOUNT_NAME,
        AZURE_STORAGE_ACCOUNT_KEY: !!process.env.AZURE_STORAGE_ACCOUNT_KEY,
        AZURE_STORAGE_CONTAINER_NAME: !!process.env.AZURE_STORAGE_CONTAINER_NAME,
        AZURE_STORAGE_SAS_TOKEN: !!process.env.AZURE_STORAGE_SAS_TOKEN,
      },
      mongoConnectionState: mongoose.connection.readyState,
      sasTokenLength: process.env.AZURE_STORAGE_SAS_TOKEN ? process.env.AZURE_STORAGE_SAS_TOKEN.length : 0,
      // Include SAS token expiry date if present
      sasTokenExpiry: process.env.AZURE_STORAGE_SAS_TOKEN && process.env.AZURE_STORAGE_SAS_TOKEN.includes('se=') 
        ? process.env.AZURE_STORAGE_SAS_TOKEN.match(/se=([^&]+)/)?.[1] || 'unknown' 
        : 'unknown'
    };
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error generating logs', 
      message: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
