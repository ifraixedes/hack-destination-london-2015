'use strict';

var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var jadeify = require('jadeify');
var runSequence = require('run-sequence');

var AUTOPREFIXER_BROWSERS = [
'ie >= 10',
'ie_mob >= 10',
'ff >= 30',
'chrome >= 34',
'safari >= 7',
'opera >= 23',
'ios >= 7',
'android >= 4.4',
'bb >= 10'
];

// Lint JavaScript
gulp.task('jslint-client', function () {
  return gulp.src(['dev/assets/scripts/**/*.js'])
  .pipe(browserSync.stream({ once: true }))
  .pipe(gulpPlugins.eslint())
  .pipe(gulpPlugins.eslint.format());
});

gulp.task('jslint-server', function () {
  return gulp.src(['dev/**/*.js', '!dev/public/**/*', '!dev/assets/**/*'])
  .pipe(browserSync.stream({ once: true }))
  .pipe(gulpPlugins.eslint())
  .pipe(gulpPlugins.eslint.format());
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'dev/assets/styles/*.scss',
    'dev/assets/styles/**/*.css'
  ])
  .pipe(gulpPlugins.changed('styles', { extension: '.scss' }))
  .pipe(gulpPlugins.sass({
    precision: 10,
    errLogToConsole: true
  }))
  .pipe(gulpPlugins.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
  .pipe(gulp.dest('dev/public/styles'));
});

var bundler = browserify('./dev/assets/scripts/index.js', { debug: true })
  .transform(jadeify, { cache: false, compileDebug: true, pretty: true })
  .transform(babelify);
gulp.task('browserify', bundle)
bundler.on('update', bundle);
bundler.on('log', gulpPlugins.util.log);
bundler.on('error', gulpPlugins.util.log);

function bundle() {
  return bundler.bundle()
    .pipe(gulpPlugins.plumber())
    .pipe(source('bundle.js'))
    .on('error', gulpPlugins.util.log.bind(gulpPlugins.util, 'Browserify/Babel Error'))
    .pipe(gulp.dest('dev/public/scripts'));
}

gulp.task('client-scripts', ['jslint-client', 'browserify']);

// Watch Files For Changes & Reload
gulp.task('dev', ['styles', 'client-scripts', 'jslint-server'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    online: true, // If it is not set and you're offline the server take 2 minutes to run
    open: false, // Don't open the browser windows with the url when staring
    reloadDelay: 800,
    proxy: 'localhost:4000',
    port: 4040
  });

  gulpPlugins.nodemon({
    execMap: {
      js: 'babel-node --stage 0'
    },
    delay: '3',
    script: 'dev/index.js',
    ext: 'js',
    watch: ['dev'],
    ignore: ['dev/public', 'dev/assets']
  })
  .on('change', ['jslint-server'])
  .on('restart', browserSync.reload);

  gulp.watch(['dev/assets/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['dev/assets/scripts/**/*.js'], ['client-scripts']);
  gulp.watch(['dev/public/**/*'], browserSync.reload);
  gulp.watch(['dev/views/**/*'], ['client-scripts', 'reload-browser']);
});

gulp.task('reload-browser', function () {
  browserSync.reload();
});

// Clean Output Directory
gulp.task('clean', del.bind(null, [ 'dist', '.sass-cache']));

// Build Production Files
gulp.task('build', ['clean'], function (cb) {
  runSequence(['jslint-client', 'client-scripts:dist', 'styles:dist', 'images', 'fonts', 'server:dist', 'processed-assets'], function (error) {
    if (error) {
      cb(error);
    } else {
      gulpPlugins.util.log('`dist` directory created with the processed source files');
      cb();
    }
  });
});


// Server scripts copy
gulp.task('babel-compile-server:dist', function () {
  return gulp.src(['dev/**/*.js', '!dev/assets/**/*'])
  .pipe(gulpPlugins.babel({ stage: 0, optional: ['runtime'] }))
  .pipe(gulp.dest('dist/built'))
});

gulp.task('server:dist', ['babel-compile-server:dist'], function () {
  return gulp.src([
    'dev/**/*',
    '!dev/**/*.js',
    '!dev/public{,/**}',
    '!dev/assets{,/**}'
  ])
  .pipe(gulp.dest('dist/built'))
  .pipe(gulpPlugins.size({ title: 'server' }));
});

// Copy processed assets
gulp.task('processed-assets', function () {
  return gulp.src([
    'dev/public/*',
    'dev/public/**/vendor/**/*'
  ])
  .pipe(gulp.dest('dist/built/public'))
  .pipe(gulpPlugins.size({ title: 'processed assets' }));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('dev/public/images/**/*')
  .pipe(gulpPlugins.cache(gulpPlugins.imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/built/public/images'))
  .pipe(gulpPlugins.size({ title: 'images' }));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['dev/public/font/**'])
  .pipe(gulp.dest('dist/built/public/font'))
  .pipe(gulpPlugins.size({ title: 'fonts' }));
});

// Client Scripts
// For client side no es7 options are set
gulp.task('browserify:dist', function () {
  return browserify('./dev/assets/scripts/index.js', { debug: false }).transform(babelify).bundle()
  .on('error', gulpPlugins.util.log.bind(gulpPlugins.util, 'Browserify/Babel Error'))
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('dev/public/scripts'))
});

gulp.task('client-scripts:dist', ['browserify:dist'], function () {
  return gulp.src(['dev/public/scripts/bundle.js'])
  .pipe(gulpPlugins.uglify('bundle.js'))
  .pipe(gulp.dest('dist/built/public/scripts'))
  .pipe(gulpPlugins.size({ title: 'public/bundle.js' }));
});

gulp.task('styles:dist', ['styles'], function () {
  return gulp.src('dev/public/styles/**/*.css')
  .pipe(gulpPlugins.csso())
  .pipe(gulp.dest('dist/built/public/styles'))
  .pipe(gulpPlugins.size({ title: 'styles' }));
});
