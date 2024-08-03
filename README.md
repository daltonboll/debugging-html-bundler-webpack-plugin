This is a small repo created with the purpose of debugging [issue #102 of the html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin/issues/102#issuecomment-2266675508).

# Running the project
To run webpack in production mode, use: `npm run prod-build` (this wraps a call to `webpack --mode production`).

To run webpack in development mode, use: `npm run dev-build` (this wraps a call to `webpack --mode development`).

Open the resulting `index.html` file with your browser (located in `dist/`) to see the result.


# File structure
The source files are located in `src/`. The `src/index.html` file has 3 `<p>` elements in it that are individually targeted by 3 different .scss file imports. The HTML file imports a JS file, `src/index.js`. This JS file imports the 3 .scss files.


# The bug
In production mode, all 3 .scss imports work as expected. However, in development mode, only the `?inline` .scss import works as expected. The 2 regular .scss imports are not included in the bundled output. There is no error message.

Interestingly, if you remove the `?inline` .scss import, then the other 2 .scss imports **DO** work as expected in development mode.
