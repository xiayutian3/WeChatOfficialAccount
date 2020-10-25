module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/dist/'
    : '/',
  lintOnSave: true,
  configureWebpack: {
    externals: {
      axios: 'axios',
      wx: 'wx'
    }
  },
  devServer: {
    proxy: {
      '/': {
        target: 'http://localhost:3000'
      }
    }
  }
}
