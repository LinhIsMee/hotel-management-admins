import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      }
    },
    fs: {
      // Đảm bảo nghiêm ngặt để tránh lỗi bảo mật
      strict: true,
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      // Tối ưu hóa kích thước bundle
      output: {
        manualChunks: {
          excel: ['exceljs'],
          vendor: ['vue', 'file-saver']
        }
      }
    },
    // Tăng giới hạn kích thước của chunk
    chunkSizeWarningLimit: 2000
  },
  optimizeDeps: {
    include: ['file-saver'],
    exclude: ['exceljs'] // Loại bỏ exceljs khỏi optimizeDeps để nó được tải động
  }
});
