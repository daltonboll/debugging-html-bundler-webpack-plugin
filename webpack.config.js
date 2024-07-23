const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

// The location of my front-end files (html, css, js).
const FRONT_END_DIRECTORY = "src/main/frontend";

// The location of the build output (e.g., minified files).
const BUILD_OUTPUT_DIRECTORY = "target/classes/static";

module.exports = (env, argv) => ({
  target: 'web',

  output: {
    path: path.resolve(__dirname, `./${BUILD_OUTPUT_DIRECTORY}`),
    clean: true,
    publicPath: '',
  },

  plugins: [
    new HtmlBundlerPlugin({
      entry: `${FRONT_END_DIRECTORY}/`,
      js: {
        filename: '[name].[contenthash].js',
        outputPath: '',
      },
      css: {
        filename: '[name].[contenthash].css',
        outputPath: '',
      },
    }),
  ],

  module: {
    rules: [
      {
        // Note that my actual project is a React project, which is why I'm using Babel and have a rule for JSX files.
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),
        use: ['babel-loader']
      },
      {
        test: /\.(s?css)$/,
        include: path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),
        oneOf: [
          {
            resourceQuery: /inline/, // <= matches e.g., styles.scss?inline. I've also tried just not doing this query at all and always using 'css-loader' and 'sass-loader' with the default configurations.
            // TODO: is there some other configuration that I have to do in order to get the imports to work?
            use: [
              {
                loader: 'css-loader',
                options: {
                  // exportType: 'css-style-sheet', <= doesn't work, though it does allow me to import a CSSStyleSheet object and inject the CSS into the HTML using document.adoptedStyleSheets
                  // exportType: 'string', <= doesn't work
                  exportType: 'array', // <= doesn't work
                },
              },
              {
                loader: 'sass-loader',
              },
            ],
          },
          {
            use: [
              'css-loader',
              'sass-loader',
            ],
          }
        ],

      },
    ]
  },

  resolve: {
    modules: [
      path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '...'],
  },

  devServer: {
    port: 8081,
    compress: true,
    watchFiles: [
      `${FRONT_END_DIRECTORY}/**/*.html`,
      `${FRONT_END_DIRECTORY}/**/*.js`,
      `${FRONT_END_DIRECTORY}/**/*.jsx`,
      `${FRONT_END_DIRECTORY}/**/*.scss`,
      `${FRONT_END_DIRECTORY}/**/*.css`,
    ],
    proxy: [
      {
        context: '**',
        target: 'http://localhost:8080',
        secure: false,
        prependPath: false,
        headers: {
          'X-Devserver': '1',
        }
      }
    ]
  }
});
