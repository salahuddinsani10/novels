#!/bin/bash
set -e

# Clean up any previous build artifacts
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies with specific Rollup version
npm install --no-optional
npm install rollup@3.29.4 --save-exact

# Run the build
npm run build

echo "Build completed successfully!"
