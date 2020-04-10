const path = require('path');
const webpack = require('webpack');
const getPackageJson = require('./scripts/getPackageJson');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const {
  version,
  name,
  license,
  repository,
  author,
} = getPackageJson('version', 'name', 'license', 'repository', 'author');

const banner = `
  ${name} v${version}
  ${repository.url}

  Copyright (c) ${author.replace(/ *\<[^)]*\> */g, " ")}

  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: "development",
  entry: './dev/app.js',
  output: {
    filename: 'dsa.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Testing Page For SDK',
      header: 'Use the console to test the DSA SDK',
      template: './dev/index.html',
      filename: 'index.html' 
    }),
    new webpack.BannerPlugin(banner),
  ],
  devServer: {
    contentBase: './dist',
  }
}