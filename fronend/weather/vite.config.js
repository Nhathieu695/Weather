import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Bật source map cho quá trình build
  },
  server: {
    sourcemap: true, // Bật source map cho quá trình phát triển
    cors: true,
  },
})
