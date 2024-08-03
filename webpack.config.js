import { default as HtmlBundlerPlugin } from "html-bundler-webpack-plugin";

/**
 * The Path API will be used to get the absolute path to the directory where we plan to run Webpack.
 */
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** The full path to our front-end directory, e.g., /Users/.../path/to/{SOURCE_DIRECTORY} */
const FULL_PATH_TO_SOURCE_DIRECTORY = path.resolve(__dirname, "./src");

/** The full path to our build directory, e.g., /Users/.../path/to/{BUILD_OUTPUT_DIRECTORY} */
const FULL_PATH_TO_BUILD_DIRECTORY = path.resolve(__dirname, "./dist");

export default (env, argv) => ({
  target: 'web',

  output: {
    path: FULL_PATH_TO_BUILD_DIRECTORY,
    clean: true,
    publicPath: '',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: FULL_PATH_TO_SOURCE_DIRECTORY,
      entryFilter: {
        includes: [/\.html$/,],
        excludes: [/node_modules/],
      },
      verbose: true,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(s?css)$/,
        use: [ 'css-loader', 'sass-loader' ],
      },
    ]
  },

  resolve: {
    modules: [
      FULL_PATH_TO_SOURCE_DIRECTORY,
      'node_modules'
    ],
  },
});
