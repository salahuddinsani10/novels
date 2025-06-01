# Deploying Novelistan AI to Render with Docker

This guide provides step-by-step instructions for deploying the Novelistan AI application to Render using Docker.

## Prerequisites

- A Render account (https://render.com)
- Your MongoDB connection string
- Your Azure Storage credentials (if using Azure Blob Storage)
- Git repository with your code

## Deployment Steps

### 1. Create a Web Service for the Backend

1. Log in to your Render dashboard
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `novelistan-backend`
   - **Environment**: Docker
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: `backend` (if your Dockerfile is in the backend directory)
   - **Environment Variables**: Add all the variables from your `.env.production` file:
     - `PORT`: 8082
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret
     - `NODE_ENV`: production
     - `AZURE_STORAGE_ACCOUNT_NAME`: Your Azure storage account name
     - `AZURE_STORAGE_ACCOUNT_KEY`: Your Azure storage account key
     - `AZURE_STORAGE_CONTAINER_NAME`: uploads
     - `AZURE_STORAGE_SAS_TOKEN`: Your Azure SAS token
5. Click "Create Web Service"

### 2. Create a Static Site for the Frontend

1. In your Render dashboard, click on "New" and select "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `novelistan-frontend`
   - **Branch**: main (or your preferred branch)
   - **Root Directory**: `novelistan` (if your frontend code is in the novelistan directory)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL`: The URL of your backend service (e.g., `https://novelistan-backend.onrender.com`)
4. Click "Create Static Site"

### 3. Alternative: Deploy Using Docker Compose (For Local Testing)

If you want to test the Docker setup locally before deploying to Render:

1. Make sure Docker and Docker Compose are installed on your machine
2. Navigate to the project root directory
3. Create a `.env` file with all required environment variables (copy from `.env.production` and fill in your values)
4. Run the following command:
   ```
   docker-compose up -d
   ```
5. Access the application at http://localhost

### 4. Important Configuration Notes

- The frontend is configured to automatically detect if it's running on Render and will use the appropriate backend URL.
- Make sure your MongoDB instance is accessible from Render (if using MongoDB Atlas, whitelist Render's IP addresses).
- For Azure Blob Storage, ensure your SAS token has the necessary permissions.

### 5. Troubleshooting

- If the frontend can't connect to the backend, check that the `VITE_API_BASE_URL` environment variable is set correctly.
- If you encounter CORS issues, verify that your backend CORS configuration includes your Render frontend URL.
- Check Render logs for any deployment or runtime errors.

## Maintenance

- To update your deployment, simply push changes to your connected GitHub repository. Render will automatically rebuild and deploy your application.
- Monitor your application's performance and logs through the Render dashboard.
