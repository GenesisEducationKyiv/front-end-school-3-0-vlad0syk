import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Запусти: npm run build -- --report
    process.env.ANALYZE === 'true' && visualizer({ open: true, filename: 'bundle-report.html' })
  ].filter(Boolean),
  optimizeDeps: {
    esbuildOptions: {
      // Enable TS type checking
      loader: { '.ts': 'tsx' },
    },
  },
  server: {
    port: 3000
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})