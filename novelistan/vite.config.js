import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    // Simplify build to avoid native module issues
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    minify: 'terser',
    target: 'es2018',
    chunkSizeWarningLimit: 1000,
  },
  // Use relative paths for production builds
  base: './',
  // Avoid problematic dependencies
  optimizeDeps: {
    // Disable optional dependencies
    disabled: false,
    esbuildOptions: {
      // Avoid native modules
      platform: 'browser'
    }
  },
  // Force Vite to use the Node.js crypto module instead of the browser one
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
})
