FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p uploads/books uploads/covers uploads/profiles public

# Expose the port the app runs on
EXPOSE 8082

# Command to run the application
CMD ["node", "server.js"]
