import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, cpSync, existsSync } from 'fs';
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
        try {
          const katexFontsSource = resolve('node_modules/katex/dist/fonts');
          const katexFontsDest = resolve('dist/fonts');
          if (existsSync(katexFontsSource)) {
            cpSync(katexFontsSource, katexFontsDest, { recursive: true });
            console.log('✓ Copied KaTeX fonts to dist/fonts/');
          }
        } catch (err) {
          console.warn('Warning: Could not copy KaTeX fonts:', err.message);
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
          // KaTeX math rendering
          'katex': ['katex', 'remark-math', 'rehype-katex'],
          // Vendor chunk for React and core dependencies
          'vendor': ['react', 'react-dom', 'localforage']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'pdfjs-dist',
      'pdfjs-dist/build/pdf.worker.min.js',
      'jspdf',
      'jspdf-autotable',
      'docx',
      'mammoth',
      'exceljs',
      'heic2any',
      'katex',
      'remark-math',
      'rehype-katex'
    ]
  },
  define: {
    global: 'globalThis',
  },
  worker: {
    format: 'es'
  }
});