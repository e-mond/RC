import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // PWA Configuration
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Manual chunks allocation
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react', 'clsx', 'tailwind-merge'],
          charts: ['recharts', 'chart.js', 'react-chartjs-2'],
          maps: ['leaflet', 'react-leaflet', 'ol'],
          framer: ['framer-motion'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          utils: ['axios', 'date-fns', 'dayjs', 'zustand']
        },
        // Ensure service worker is copied to dist
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js') {
            return 'sw.js';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Handle CSS imports properly
    cssCodeSplit: true,
  },
  test: {
    globals: true,           // ← This removes need for importing describe/test/expect
    environment: "jsdom",
    setupFiles: "./src/test-setup.js", // optional: for custom setup
  },
})
