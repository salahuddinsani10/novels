#!/bin/bash
set -e

# Clean up any previous build artifacts
rm -rf dist

# Install only the minimal dependencies needed for static build
npm install --only=prod --no-optional

# Run the static build script that doesn't use Vite/Rollup
node static-build.js

echo "Static build completed successfully!"
