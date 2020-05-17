/* eslint-disable */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [
    path.join(__dirname, "resources/app.scss"),
    path.join(__dirname, "resources/App.tsx"),
  ],
  mode: "production",
  devtool: "",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    // @ts-ignore
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new BundleAnalyzerPlugin(),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [new TerserWebpackPlugin(), new OptimizeCSSAssetsPlugin()],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.webpack.json",
            },
          },
        ],
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
