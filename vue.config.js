module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://103.82.24.35:9000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api/v1'
        }
      }
    }
  }
}
