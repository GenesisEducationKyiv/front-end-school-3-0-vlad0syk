import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Запусти: npm run build -- --report
    process.env.ANALYZE === 'true' && visualizer({ open: true, filename: 'bundle-report.html' })
  ].filter(Boolean),
  server: {
    port: 3000
  },
  build: {
    sourcemap: true,
  }
})