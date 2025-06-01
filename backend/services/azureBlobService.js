/**
 * Azure Blob Storage Service
 * 
 * This service provides functions to interact with Azure Blob Storage
 * for uploading, downloading, and managing files in the cloud.
 */
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

// Ensure environment variables are loaded
require('dotenv').config();

// Azure Storage configuration from environment variables
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'novelistanupload';
const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

// Debug Azure storage configuration
console.log('Azure Blob Storage configuration:');
console.log(`Account Name: ${accountName}`);
console.log(`SAS Token: ${sasToken ? '[SECURE - NOT DISPLAYED]' : '[NOT SET]'}`);
console.log(`Container Name: ${containerName}`);

// Initialize Azure Blob Storage client with SAS token
let blobServiceClient;
let isAzureConfigured = false;

try {
  if (!accountName || !sasToken) {
    throw new Error('Azure Storage account credentials are missing or invalid');
  }

  // Create blob service client using SAS token
  const accountUrl = `https://${accountName}.blob.core.windows.net`;
  blobServiceClient = new BlobServiceClient(`${accountUrl}?${sasToken}`);
  
  isAzureConfigured = true;
  console.log(`Azure Blob Storage initialized with account: ${accountName} and container: ${containerName}`);
  console.log(`SAS TOKEN LENGTH: ${sasToken.length} characters`); // Log token length for verification
} catch (error) {
  console.error('Failed to initialize Azure Blob Storage:', error.message);
  console.warn('Falling back to mock implementation for development');
  
  // Create a mock implementation for development/testing
  blobServiceClient = {
    getContainerClient: () => ({
      createIfNotExists: async () => true,
      getBlockBlobClient: (blobName) => ({
        upload: async () => ({ etag: 'mock-etag', lastModified: new Date() }),
        delete: async () => true,
        url: `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
      })
    })
  };
}

/**
 * Get or create a container for blob storage
 * @param {string} containerName - Name of the container
 * @returns {Promise<ContainerClient|Object>} - Container client (real or mock)
 */
async function getContainerClient(name = containerName) {
  // If Azure is properly configured, use the real implementation
  if (isAzureConfigured) {
    try {
      console.log(`Getting Azure container client for ${name}`);
      const containerClient = blobServiceClient.getContainerClient(name);
      
      try {
        // Try to create the container with private access (no public access)
        await containerClient.createIfNotExists({
          // Do not specify access level to respect storage account settings
        });
        console.log(`Container ${name} accessed or created successfully in Azure with private access`);
      } catch (containerError) {
        // If creation fails, the container might already exist or we don't have permission to create it
        console.log(`Container ${name} may already exist or we don't have permission to create it: ${containerError.message}`);
        // Continue anyway to try to use the existing container
      }
      
      return containerClient;
    } catch (error) {
      console.error(`Error accessing Azure container ${name}:`, error);
      throw error;
    }
  } 
  // Otherwise use the mock implementation
  else {
    console.log(`Using MOCK container client for ${name}`);
    return {
      createIfNotExists: async () => {
        console.log(`Mock: Creating container ${name} if it doesn't exist`);
        return true;
      },
      getBlockBlobClient: (blobName) => ({
        upload: async (content, contentLength, options) => {
          console.log(`Mock: Uploaded ${blobName} to ${name} container`);
          return { etag: 'mock-etag', lastModified: new Date() };
        },
        url: `https://${accountName}.blob.core.windows.net/${name}/${blobName}`
      })
    };
  }
}

/**
 * Upload a blob to Azure Storage
 * @param {Buffer} content - The content of the blob
 * @param {string} blobName - Name for the blob (file name)
 * @param {string} contentType - MIME type of the content
 * @param {string} containerName - Optional container name
 * @returns {Promise<string>} - URL of the uploaded blob
 */
async function uploadBlob(content, blobName, contentType, containerName = 'uploads') {
  try {
    console.log(`Uploading blob ${blobName} with content type ${contentType} to container ${containerName}`);
    const containerClient = await getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const uploadResult = await blockBlobClient.upload(content, content.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    // Verify the upload was successful by checking the response
    if (uploadResult.errorCode) {
      throw new Error(`Upload failed with error code: ${uploadResult.errorCode}`);
    }
    
    // Log detailed information about the successful upload
    console.log('✅ UPLOAD VERIFICATION:');
    console.log(`  - Container: ${containerName}`);
    console.log(`  - Blob Name: ${blobName}`);
    console.log(`  - Content Type: ${contentType}`);
    console.log(`  - ETag: ${uploadResult.etag}`);
    console.log(`  - Last Modified: ${uploadResult.lastModified}`);
    console.log(`  - URL: ${blockBlobClient.url}`);
    console.log(`  - Azure Storage: ${isAzureConfigured ? 'REAL' : 'MOCK'}`);
    
    return blockBlobClient.url;
  } catch (error) {
    console.error(`❌ Error uploading blob ${blobName}:`, error);
    
    if (!isAzureConfigured) {
      console.log(`Mock: Getting container client for ${containerName}`);
      console.log(`Mock: Uploaded ${blobName} to ${containerName} container`);
      return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    }
    
    throw error;
  }
}

/**
 * Upload a file from a local path to Azure Blob Storage
 * @param {string} filePath - Local path to the file
 * @param {string} blobName - Name for the blob (file name)
 * @param {string} contentType - MIME type of the content
 * @param {string} containerName - Optional container name
 * @returns {Promise<string>} - URL of the uploaded blob
 */
async function uploadFileFromPath(filePath, blobName, contentType, containerName) {
  try {
    console.log(`Uploading file from path ${filePath} as ${blobName}`);
    const fs = require('fs');
    const content = fs.readFileSync(filePath);
    return uploadBlob(content, blobName, contentType, containerName);
  } catch (error) {
    console.error(`Error uploading file from path ${filePath}:`, error);
    throw error;
  }
}

/**
 * Delete a blob from Azure Storage
 * @param {string} blobName - Name of the blob to delete
 * @param {string} containerName - Optional container name
 * @returns {Promise<void>}
 */
async function deleteBlob(blobName, containerName) {
  try {
    console.log(`Deleting blob ${blobName} from container ${containerName || containerName}`);
    const containerClient = await getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    console.log(`Successfully deleted blob ${blobName} from ${containerName || containerName}`);
    return true;
  } catch (error) {
    console.error(`Error deleting blob ${blobName}:`, error);
    throw error;
  }
}

module.exports = {
  uploadBlob,
  uploadFileFromPath,
  deleteBlob,
  getContainerClient
};

console.log('Azure Blob Storage service initialized successfully.')
