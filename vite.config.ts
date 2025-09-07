import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap', '@gsap/react']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['gsap', '@gsap/react'],
    exclude: ['lucide-react'],
  },
})