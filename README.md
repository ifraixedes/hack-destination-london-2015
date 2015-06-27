Express server with ES7 support, Jade, Browserify & Sass compilation externally with Gulp
=========================================================================================

This gulpfile allows to develop a web site/app with a custom [NodeJS](https://nodejs.org/) backend with ES7 features on an opinionated organisation, which if you don't feel comfortable you can change it spending a little bit time, although it may not make sense if that it's the case.

Both scripts, backend & frontend scripts, supports ES7  syntax because they're compiled by [BabelJS](https://babeljs.io/), so the ES7 features available are the same the version of BabelJS which is used at the time (know what is in [___package.json___](https://github.com/ifraixedes/dev-toolbox/blob/master/babeljs/es7-express-web-jade-gulp-sass-browsersync/package.json))

This is a scaffolder, so the it comes with some common middlewares and organised in a general way that fulfill the most of my projects when I start them. The structure try to be simple, however for me it's and for you maybe it's not that easy because you haven't created it hence you'll have to spend some time to get that comfortability.

It also provides "sass" compilations and some frontend optimisations with [BrowserSync](http://www.browsersync.io/) to help you in the development process.

## How Works

This instructions consider that you're in the root folder of your project which must contains the `package.json` and `gulpfile.js` of this git repository's directory.

### Dependencies

Any required dependency will be installed with `npm install`.

Only the dependencies required for gulpfile are in `package.json`; you must create your [NodeJS](https://nodejs.org/) server (backend) and add to `package.json` that it require.

### Bootstrap

Run `npm run bootstrap` and you will get the project folder structure used by `gulpfile`

### Directory Structure

The root directory contains two directories "dev" and "dist"; you may not see "dist" directory, that's OK, it's created when you run `npm run build` at the first time.

The important directory is "dev", because it's where you have to add your files; "dist" directory is auto-generated, and basically create a "production" version of your site/app, then you shouldn't commit into your repository.

In "__dev__" directory is where you have to create your files, you have the freedom in how to structure your server, the current one it's my choice; frontend stuff must be settle into specific directories to be able to  with some exceptions, which are

* __public/image__ should contains all the image files
* __public/fonts__ should contains all the fonts files
* __assets/styles__ subfolder contains all the "css" and "sass" files; "css" files will be __automatically added the browser prefixes__ and "scss" files will be compiled to "css" and left in "__public/styles__" directory; bear in mind that the main "scss" must be named "main.scss", which must import everything that you want to be compiled, the compiled file will be name __"main.css"__ and it will be dropped in "dist/styles".
  If you have styles that you don't want to be processed, just add them in "__public/styles__"

* __assets/scripts__ contains all the ___javascripts___ files; the files will be compiled to ES5, optimised (concatenated and minified) by [uglify](https://github.com/mishoo/UglifyJS) and the result file, named __"bundle.js"__, will be dropped in "__public/scripts__".
  If you have scripts that you don't want to be added to "bundle.js", just add them in "__public/scripts__".


### Development Process

To work in your project run `npm run dev`

It runs a [BrowserSync](http://www.browsersync.io/) which runs an HTTP proxy for your server auto-refreshes your browser when files change.

Your server's implementation must have and "__dev/index.js__" which must run the server always listening in the __port 4000__; [nodemon](https://github.com/remy/nodemon) will start and stop the server when your server files change, that means than it doesn't restart the server when frontend files change (sass, css, frontend javascript), however any change in assets will trigger the associated tasks and will notify [BrowserSync](http://www.browsersync.io/) to auto-refresh your browser

Your server doesn't never serve any file from "__dev/assets__" because they're development files which are processed by gulp which produces the proper assets to consume into "__dev/public__", as commented in [Directory Structure](#directory-structure).

The HTTP server running by [BrowserSync](http://www.browsersync.io/) will listen in port 8000; note that it uses [BrowserSync](http://www.browsersync.io/) 2.x, hence you can get access to its administration interface through 8080 port.

The development process also lints your javascript files using [ESLint](http://eslint.org/); because you'll probably need different linter configurations for your server (backend) scripts and frontend scripts, you can do it, creating to different `[.eslintrc](http://eslint.org/docs/user-guide/configuring)`, one in "dev" folder and another into "dev/assets/scripts". Note "public/scripts" directory is excluded from the linting process.

You should frequently check the console's output, because if there's any error compiling, linting or whatever task associated with a file type which fails, the error message will be showed in it, so you will know about the issue; you'll also see several info messages, which are useful to know what tasks are running on each change.

__NOTE__ file watching process sometimes doesn't consider new files created in that folder, therefore it that happens it won't be processed then won't be available in "dist" folder; if that happens, close the process (ctrl + c) and run again `npm run dev`


### Production Build

To create the production build of your site/app you have to run `npm run build`.

Production build create a directory in the root project folder named "dist" which contain all the scripts, __compiled__ (so BabelJS runtime isn't needed to run in production), that your application needs to run; it means that no "scss" files or javascript files placed in "dev/assets/scripts" will be there.

All the frontend javascript will be optimised (concatenation and minification through [uglify](https://github.com/mishoo/UglifyJS)).

Images ("dev/public/images") will be optimised before copying them into "dist".

You can test your production build running your server "dist/index.js" and see that everything works.

Bear in mind that you may want to do other optimisations or tasks for your production build, hence it's helper which may fulfill your production build requirements completely, partially or not to provide what you need.
