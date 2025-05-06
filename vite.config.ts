import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'ws://89.169.168.253:4500',
        ws: true,
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['socket.io-client']
  }
})