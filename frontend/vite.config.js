
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/camera-stream': {
        target: 'http://10.19.158.145:81',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/camera-stream/, '/stream'),
      },
    },
  },
})
