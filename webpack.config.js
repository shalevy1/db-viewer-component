/* global require, module, __dirname */

const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './',
    port: 9998,
    historyApiFallback: {
      index: './example/index.html'
    }
  },
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
