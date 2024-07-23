This is a small project created with the purpose of debugging [issue #102 of the html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin/issues/102).

This project uses Spring Boot on the back-end and requires maven and npm to run. To run this project, use:

`mvn spring-boot:run`

You can then visit http://localhost:8080/ to see the project home page.

The back-end files live in `src/main/java` and the front-end files live in `src/main/frontend`. To see the error described in issue #102, uncomment either of the `import` statements in `src/main/frontend/home.js`.
