const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'web',
  //externals: [nodeExternals()], // removes node_modules from your final bundle
  entry: './src/modules/damageBlocks/mathWorker.tsx', // make sure this matches the main root of your code
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: 'workerbuild.json'
          }
        }],
        include: [
          path.resolve('node_modules/fraction.js/'),
          path.resolve('node_modules/lodash.memoize/'),
          path.resolve('src/'),
        ],
        exclude: /node_modules\/(?!(fraction\.js)|(lodash\.memoize))/

      }
    ]
  },
  output: {
    path: path.join(__dirname, 'public'), // this can be any path and directory you want
    filename: 'mathWorker.js'
  },
  optimization: {
    minimize: false // enabling this reduces file size and readability
  },
  resolve: {
    alias: {
      '@damage': path.resolve(__dirname, 'src/modules/damage'),
      '@utils': path.resolve(__dirname, 'src/utils')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
};
