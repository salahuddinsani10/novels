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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    minify: 'terser',
    target: 'es2018',
    chunkSizeWarningLimit: 1000,
  },
  // Use absolute paths for production builds on Render
  base: '/',
  optimizeDeps: {
    esbuildOptions: {
      platform: 'browser'
    }
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
})
