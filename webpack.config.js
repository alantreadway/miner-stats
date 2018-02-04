const path = require('path');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: slsw.lib.entries,
  devtool: 'source-map',
  externals: [
    'aws-sdk',
    'aws-lambda',
  ],
  resolve: {
    mainFields: ['main'],
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./src')
    ],
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.ts',
      '.tsx'
    ]
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'src/**/*.json' },
    ]),
  ],
};
