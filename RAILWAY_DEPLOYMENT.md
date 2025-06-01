# Deploying Novelistan AI to Railway

This guide provides step-by-step instructions for deploying the Novelistan AI application to Railway.

## Prerequisites

- A Railway account (https://railway.app)
- Your MongoDB connection string (or you can use Railway's MongoDB plugin)
- Your Azure Storage credentials (for file storage)
- Git repository with your code

## Deployment Steps

### 1. Deploy the Backend

1. **Sign up/Login to Railway**
   - Go to [Railway.app](https://railway.app/) and sign up or log in with GitHub

2. **Create a New Project**
   - Click on "New Project" in the Railway dashboard
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select your Novelistan AI repository

3. **Configure the Backend Service**
   - In your new project, click "New Service" → "GitHub Repo"
   - Select your repository
   - Configure the service:
     - **Root Directory**: `backend` (specify the backend folder)
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

4. **Set Environment Variables**
   - In your backend service, go to the "Variables" tab
   - Add all the necessary environment variables:
     - `PORT`: 8082
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret
     - `NODE_ENV`: production
     - `AZURE_STORAGE_ACCOUNT_NAME`: Your Azure storage account name
     - `AZURE_STORAGE_ACCOUNT_KEY`: Your Azure storage account key
     - `AZURE_STORAGE_CONTAINER_NAME`: uploads
     - `AZURE_STORAGE_SAS_TOKEN`: Your Azure SAS token

5. **Deploy the Backend**
   - Railway will automatically deploy your backend service
   - Wait for the deployment to complete
   - Note the generated URL (e.g., https://novelistan-backend-production.up.railway.app)

### 2. Deploy the Frontend

1. **Add a New Service**
   - In your Railway project, click "New Service" → "GitHub Repo"
   - Select your repository again
   - Configure the service:
     - **Root Directory**: `novelistan` (specify the frontend folder)
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npx serve -s dist`

2. **Set Environment Variables**
   - In your frontend service, go to the "Variables" tab
   - Add the following environment variable:
     - `VITE_API_BASE_URL`: The URL of your backend service (e.g., https://novelistan-backend-production.up.railway.app)

3. **Deploy the Frontend**
   - Railway will automatically deploy your frontend service
   - Wait for the deployment to complete
   - Note the generated URL (e.g., https://novelistan-frontend-production.up.railway.app)

### 3. Update Frontend Configuration

Before deploying, you need to update your frontend configuration to work with Railway:

1. Open `novelistan/src/config.js`
2. Update the file to include Railway URLs:

```javascript
// Determine if we're running on a deployed site or locally
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Choose API URL based on environment
// Using environment variable if available, otherwise use local development URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isLocalhost ? 'http://localhost:8082' : 
   // Check if we're on Railway
   window.location.hostname.includes('railway.app') ? 
     // If on Railway, use the backend service URL from env var
     'https://novelistan-backend-production.up.railway.app' : 
     // Fallback to Azure URL for backward compatibility
     'https://novelistanai.azurewebsites.net/');

export default API_BASE_URL;
```

### 4. Set Up Custom Domain (Optional)

1. In your Railway project, go to the "Settings" tab
2. Under "Domains", click "Generate Domain" or "Add Custom Domain"
3. Follow the instructions to set up your custom domain

### 5. MongoDB Setup Options

You have two options for MongoDB:

1. **Use Your Existing MongoDB**
   - Keep using your existing MongoDB connection string
   - Make sure it's accessible from Railway's servers

2. **Use Railway's MongoDB Plugin**
   - In your Railway project, click "New" → "Database" → "MongoDB"
   - Railway will create a MongoDB instance
   - Get the connection string from the "Connect" tab
   - Update your backend's `MONGODB_URI` environment variable

### 6. Troubleshooting

- If the frontend can't connect to the backend, check that the `VITE_API_BASE_URL` environment variable is set correctly
- If you encounter CORS issues, verify that your backend CORS configuration includes your Railway frontend URL
- Check Railway logs for any deployment or runtime errors by clicking on the "Logs" tab in your service

### 7. Monitoring and Scaling

- Railway provides monitoring tools in the "Metrics" tab
- You can scale your services in the "Settings" tab under "Scaling"
- Set up alerts in the "Alerts" tab to be notified of issues

## Maintenance

- To update your deployment, simply push changes to your connected GitHub repository
- Railway will automatically rebuild and deploy your application
- You can also manually trigger deployments from the Railway dashboard
