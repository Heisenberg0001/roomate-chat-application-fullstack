const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HTMLWebpackConfig = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

const filename = (extension) => {
  return `bundle.[hash].${extension}`;
};
const getJSLoaders = () => {
  const loaders = [
    {
      loader: "ts-loader",
      options: {
        configFile: "tsconfig-client.json"
      }
    }
  ];

  return loaders;
};

const config = {
  mode: "development",
  context: path.resolve(__dirname, "src/View"),
  entry: ["./entry.ts"],
  output: {
    filename: filename("js"),
    path: path.resolve(__dirname, "dist/public")
  },
  devServer: {
    port: 4200,
    hot: true
  },
  devtool: false,
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src/View")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: getJSLoaders()
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: {
              hmr: false,
              reloadAll: true,
              publicPath: path.resolve(__dirname, "dist/public")
            }
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")]
            }
          },
          "sass-loader"
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HTMLWebpackConfig({
      template: "index.html",
      minify: true
    }),
    new MiniCSSExtractPlugin({
      filename: filename("css")
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "src/View/favicon.png"),
        to: path.resolve(__dirname, "dist/public")
      },
      {
        from: path.resolve(__dirname, "src/View/assets/image"),
        to: path.resolve(__dirname, "dist/public/assets/image")
      },
      {
        from: path.resolve(__dirname, "src/View/assets/font"),
        to: path.resolve(__dirname, "dist/public/assets/font")
      }
    ])
  ]
};

module.exports = config;
