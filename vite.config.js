export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://103.82.24.35:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
