import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      // More aggressive HMR configuration for problematic cloud environments
      timeout: 30000, // Increased to 30 seconds
      overlay: false, // Disable overlay to prevent additional fetch errors
      // Try different port for WebSocket
      port: 24679,
      // Add client error handling
      clientErrorOverlay: false,
    },
    // Add host configuration for cloud environment
    host: '0.0.0.0', // More explicit host binding
    // Increase watch options timeout for cloud file system latency
    watch: {
      usePolling: true,
      interval: 2000, // Increased polling interval
      ignored: ['**/node_modules/**'], // Ignore node_modules for better performance
    },
    // Add more stability options
    cors: true,
    strictPort: false, // Allow port fallback
    proxy: {
      '/api': {
  target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        timeout: 15000, // Increased timeout
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  // Add build optimizations that might help with dev server stability
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Force pre-bundling of common dependencies
    force: true
  }
})
