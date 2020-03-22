/* eslint-disable */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [
    path.join(__dirname, "static/app.scss"),
    path.join(__dirname, "static/app.ts"),
  ],
  resolve: {
    extensions: [".ts"],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserWebpackPlugin(), new OptimizeCSSAssetsPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node-modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.join(__dirname, "/dist/css"),
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
};
