const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { logMessage } = require('./logger.cjs');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'], // Ensure all necessary extensions are listed
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify")
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      // CSS Modules (for files ending with .module.css)
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      // Regular CSS files
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'], // Ensure all necessary extensions are listed
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
    }),
  ],
  devServer: {
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }
      const port = devServer.server.address().port;
      logMessage(`Listening on port: ${port}`);
    },
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8081,
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'ssl', 'server.crt')),
      },
    },
    client: {
      webSocketURL: {
        protocol: 'wss',
        hostname: 'localhost',
        port: 8081,
      },
    },
    hot: true,
  },
  devtool: 'inline-source-map',
};
