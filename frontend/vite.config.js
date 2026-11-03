import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const esp32IP = env.VITE_ESP32_IP || ''

  return {
    plugins: [react()],

    server: {
      proxy: esp32IP ? {
        '/proxy-stream': {
          target: `http://${esp32IP}:81`,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/proxy-stream/, '/stream'),
        },
      } : {},
    },
  }
})
