module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable fork-ts-checker-webpack-plugin to avoid AJV issues
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );
      
      return webpackConfig;
    },
  },
  typescript: {
    enableTypeChecking: false,
  },
};