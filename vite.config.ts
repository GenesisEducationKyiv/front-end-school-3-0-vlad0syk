import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React
          if (id.includes('react') && !id.includes('react-router') && !id.includes('react-window')) {
            return 'react-core';
          }
          // Apollo GraphQL
          if (id.includes('@apollo/client') || id.includes('graphql')) {
            return 'apollo-gql';
          }
          // React Router
          if (id.includes('react-router')) {
            return 'react-router';
          }
          // UI Libraries
          if (id.includes('react-window') || id.includes('react-toastify')) {
            return 'ui-libs';
          }
          // Utilities
          if (id.includes('lodash') || id.includes('zod') || id.includes('neverthrow')) {
            return 'utils';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          // State management
          if (id.includes('zustand')) {
            return 'state';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // App chunks
          if (id.includes('src/components')) {
            return 'components';
          }
          if (id.includes('src/services') || id.includes('src/lib')) {
            return 'services';
          }
        },
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `img/[name]-[hash:8].[ext]`;
          }
          if (/\.(css)$/i.test(name)) {
            return `css/[name]-[hash:8].[ext]`;
          }
          return `assets/[name]-[hash:8].[ext]`;
        },
      },
    },
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 1024, // Inline assets smaller than 1KB
  },
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
  },
  css: {
    devSourcemap: false,
  },
})