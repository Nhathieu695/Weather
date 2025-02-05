import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Bật source map cho quá trình build
  },
  server: {
    host: '0.0.0.0', // Lắng nghe trên mọi địa chỉ IP
    port: 5173, // Cổng bạn muốn sử dụng
    cors: true,
  },
})
