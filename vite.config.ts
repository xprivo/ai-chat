import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-seo-files',
      closeBundle() {
        try {
          copyFileSync('robots.txt', 'dist/robots.txt');
          copyFileSync('sitemap.xml', 'dist/sitemap.xml');
          console.log('✓ Copied robots.txt and sitemap.xml to dist/');
        } catch (err) {
          console.warn('Warning: Could not copy SEO files:', err.message);
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunk for PDF processing
          'pdf-worker': ['pdfjs-dist'],
          // Separate chunk for file processing utilities
          'file-processing': ['mammoth', 'exceljs', 'heic2any'],
          // Separate chunk for UI components
          'ui-components': ['lucide-react'],
          // RevenueCat bundled separately for iOS
          //'revenuecat': ['@revenuecat/purchases-capacitor'],
          // Vendor chunk for React and core dependencies
          'vendor': ['react', 'react-dom', 'localforage']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.min.js']
  },
  define: {
    global: 'globalThis',
  },
  worker: {
    format: 'es'
  }
});