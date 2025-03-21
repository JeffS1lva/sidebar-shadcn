import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://10.101.200.180:7000',
        changeOrigin: true,
        secure: false,
        headers: {
          Connection: 'keep-alive'
        },
        configure: (proxy, _options) => {
          // Log the request details
          proxy.on('proxyReq', function(_proxyReq, req, _res, _options) {
            console.log(`Proxying ${req.method} request to: ${req.url}`);
            console.log('Authorization header present:', !!req.headers.authorization);
          });

          // Log the response status
          proxy.on('proxyRes', function(proxyRes, req, _res) {
            console.log(`Response from ${req.url}: ${proxyRes.statusCode}`);
            if (proxyRes.statusCode === 401) {
              console.log('Authentication failed for request');
            }
          });

          // Log proxy errors
          proxy.on('error', function(err, _req, res) {
            console.error('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('Proxy error: ' + err.message);
          });
        }
      }
    }
  }
});