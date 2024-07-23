/**
 * The Path API will be used to get the absolute path to the directory where we plan to run Webpack.
 */
const path = require('path');

/**
 * This is what we will use to transpile our js, css, and images from our .html files into minimized code with hashed
 * file names and place them in the build output directory.
 *
 * Documentation: https://github.com/webdiscus/html-bundler-webpack-plugin
 */
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

/** The directory for our front-end files, relative to the root of the application. */
const FRONT_END_DIRECTORY = "src/main/frontend";

/** The directory for our build output files, relative to the root of the application. */
const BUILD_OUTPUT_DIRECTORY = "target/classes/public";

/**
 * Takes in a source file and returns a string containing the path, filename, and extension of the corresponding build
 * output file. The build output file's path will match the source file's path relative to the {FRONT_END_DIRECTORY}.
 *
 * For example, given a source file "/some/path/to/{FRONT_END_DIRECTORY}/tutorial/js/tutorial.root.js", this would
 * return "tutorial/js/[name].[contenthash].js". Webpack will automatically replace [name] with the filename and
 * [contenthash] with a generated hashcode. Note that we can't just extract the name from the source file ourselves
 * because Webpack does some intermittent processing that can cause naming issues for CSS files that are imported into
 * JS files.
 *
 * @param {string} sourceFilePathAndName - Includes the entire file path, filename, and extension of the source file.
 *   As long as the path includes FRONT_END_DIRECTORY, it doesn't matter where it starts from. It may even start from
 *   outside of the project directory, e.g., /Users/.../.../...
 * @param {string} [outputFileExtension] - The file extension of the build output file. Optional. If excluded, then the
 *   file extension of the build output file will match the extension of the source file.
 * @return {string}
 */
function getOutputFilePathAndNameFromSource(sourceFilePathAndName, outputFileExtension = undefined) {
  // This obtains the relative path starting from the front-end directory.
  // Example: given /Users/.../{FRONT_END_DIRECTORY}/tutorial/js/tutorial.root.js
  // This would return tutorial/js/tutorial.root.js
  const frontEndDirectoryEscaped = (FRONT_END_DIRECTORY + "/").replaceAll("/", "\\/");
  const regExp = new RegExp(`${frontEndDirectoryEscaped}(.*)$`);
  const relativePathFromFrontEndDirectory = sourceFilePathAndName.match(regExp)[1];

  const pathObject = path.parse(relativePathFromFrontEndDirectory);
  const sourceFilenameNoExtension = pathObject.name;
  const sourceFileExtension = pathObject.ext;
  const sourceFilenameWithExtension = sourceFilenameNoExtension + sourceFileExtension;

  // Remove the filename and extension from the path. This will end in a trailing "/".
  // Example: tutorial/js/tutorial.root.js becomes tutorial/js/
  const relativePathOnly = relativePathFromFrontEndDirectory.slice(0, -1 * sourceFilenameWithExtension.length);

  // If no extension was provided, use the same extension as the source file.
  const extensionToUse = outputFileExtension === undefined ? sourceFileExtension : outputFileExtension;

  return `${relativePathOnly}[name].[contenthash]${extensionToUse}`;
}

// Note that usually webpack uses the `entry` property to specify all of the entrypoints to the application. Those
// entrypoints would be JavaScript files, with each page having a single top-level root JS file as an entrypoint.
// However, since I am using the HtmlBundlerPlugin, I'm specifying that the .html file for a page is the entrypoint
// instead. So we are not defining the `entry` property at all.
module.exports = (env, argv) => ({
  // Specifies that webpack should compile files for usage in a web browser environment.
  target: 'web',

  output: {
    // Specifies the build output directory, which is where the transpiled files should go.
    path: path.resolve(__dirname, `./${BUILD_OUTPUT_DIRECTORY}`),

    // Deletes everything in the build output directory before each build.
    clean: true,

    // This is required for links to things like CSS, JS, and images in HTML files to load properly in the browser.
    // Without it, relative paths will be broken.
    publicPath: '',
  },

  plugins: [
    // Credit to https://dev.to/webdiscus/using-html-bundler-plugin-for-webpack-to-generate-html-files-30gd
    // for a thorough explanation on how to set this plugin up.
    new HtmlBundlerPlugin({
      // Defines where the plugin should search for HTML files. It will recursively look for any file ending in .html
      // within this directory.
      entry: `${FRONT_END_DIRECTORY}/`,

      entryFilter: {
        includes: [/\.html$/,], // Includes all HTML files within the directory.
        excludes: [/node_modules/],  // Excludes all HTML files within any node_modules subdirectory.
      },

      // Defines the output path and filename for JS files, relative to BUILD_OUTPUT_DIRECTORY. Since the `filename`
      // returned from `getOutputFilePathAndNameFromSource` actually includes the path to the file, we leave
      // `outputPath` empty.
      js: {
        // Note that pathData is a PathData object. See https://webpack.js.org/configuration/output/#template-strings
        // (and scroll down)
        filename: (pathData) => getOutputFilePathAndNameFromSource(pathData.filename, ".js"),
        outputPath: '',
      },

      // Defines the output path and filename for CSS files (and transpiled SCSS files), relative to
      // BUILD_OUTPUT_DIRECTORY. Since the `filename` returned from `getOutputFilePathAndNameFromSource` actually
      // includes the path to the file, we leave `outputPath` empty.
      css: {
        // Note that pathData is a PathData object. See https://webpack.js.org/configuration/output/#template-strings
        // (and scroll down)
        filename: (pathData) => getOutputFilePathAndNameFromSource(pathData.filename, ".css"),
        outputPath: '',
      },
    }),
  ],

  module: {
    rules: [
      // Specifies rules for JS and JSX files.
      {
        test: /\.(js|jsx)$/,

        // Only files in this directory will be considered.
        include: path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),

        // Excludes files matching this directory.
        exclude: /node_modules/,

        // Indicates that babel should be used to transpile the files.
        use: ['babel-loader']
      },
      // Specifies rules for SCSS and CSS files.
      {
        test: /\.(s?css)$/,

        // Only files in this directory will be considered.
        include: path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),

        // Excludes files matching this directory.
        exclude: /node_modules/,

        // Note that the loaders are executed in order from right to left (so sass-loader runs first).
        use: [ 'css-loader', 'sass-loader' ],
      },
      // Specifies rules for images.
      {
        test: /\.(jpe?g|png|gif|svg|webp|ico)$/i,

        // Only files in this directory will be considered.
        include: path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),

        // Excludes files matching this directory.
        exclude: /node_modules/,

        type: 'asset',
        generator: {
          // Defines the output path and filename for image files, relative to BUILD_OUTPUT_DIRECTORY. Note that the
          // `filename` parameter actually includes the full path to the file, including the filename and extension.
          filename: ({ filename }) => getOutputFilePathAndNameFromSource(filename),
        },
        parser: {
          // Optimizes the loading of small images by inlining images that are smaller than 2KB directly in the HTML.
          dataUrlCondition: {
            maxSize: 2 * 1024
          }
        },
      },
    ]
  },

  resolve: {
    modules: [
      path.resolve(__dirname, `./${FRONT_END_DIRECTORY}`),
      'node_modules'
    ],

    // Allows you to leave off the extension when importing these file types. The '...' refers to webpack's default
    // extensions.
    extensions: ['.js', '.jsx', '...'],

    // Specifies aliases that we can use for convenient imports without having to specify the full path. For example,
    // with the React$ entry below, to import React in a .js file, you could just do: `import React from "React"`.
    //
    // Note that the `$` character is used to specify an exact match path to a specific file. It wouldn't be needed for
    // aliases that correspond to a directory.
    alias: {
      '@bootstrap': path.join(__dirname, 'src/main/frontend/external/node_modules/bootstrap/scss'),
      '@bootstrap-base$': path.join(__dirname, 'src/main/frontend/external/bootstrap-base.scss'),
      Bootstrap$: path.resolve(__dirname, 'src/main/frontend/external/Bootstrap.js'),
      Popper$: path.resolve(__dirname, 'src/main/frontend/external/Popper.js'),
      React$: path.resolve(__dirname, 'src/main/frontend/external/React.js'),
      ReactDOM$: path.resolve(__dirname, 'src/main/frontend/external/ReactDOM.js'),
      ReactPopper$: path.resolve(__dirname, 'src/main/frontend/external/ReactPopper.js'),
    },
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
