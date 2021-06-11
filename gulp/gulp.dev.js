const { src, dest } = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const buffer = require('vinyl-buffer');
const sass = require('gulp-sass');

var packageJSON = require('../package.json');
var dependencies = Object.keys(packageJSON && packageJSON.dependencies || {});

const { paths, distPath } = require('./config');

function buildPages() {
  return src(paths.pages)
    .pipe(dest(distPath));
}

function buildScripts() {
  return browserify({
    basedir: '.',
    debug: true,
    entries: [paths.scripts],
    cache: {},
    packageCache: {},
  })
    .plugin(tsify)
    .transform('babelify', {
      presets: ['@babel/preset-env'],
      extensions: ['.ts'],
    })
    .require(dependencies)
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(dest(`${distPath}/js`));
}

function buildStyles() {
  return src(paths.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(`${distPath}/css`));
}

function buildResources() {
  return src(paths.resources)
    .pipe(dest(`${distPath}/resources`));
}

exports.devHtml = buildPages;
exports.devTs = buildScripts;
exports.devScss = buildStyles;
exports.devResources = buildResources;
