'use strict';

var serverlessWebpackConfig = require('../../webpack.config');
const path = require('path');

module.exports = {
  ...serverlessWebpackConfig,
  externals: [
    ...serverlessWebpackConfig.externals,
    'firebase-admin',
    'firebase-functions',
  ],
  entry: './src/firebase/index.ts',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(process.env.PWD, '.firebase'),
    filename: 'index.js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  // resolve: {
  //   mainFields: ['main'],
  //   extensions: [ '.ts', '.tsx', '.js' ],
  //   modules: [
  //     path.resolve('./node_modules'),
  //     path.resolve('./src'),
  //   ],
  // },
};
