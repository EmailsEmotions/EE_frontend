const { src, dest } = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');

const { paths, distPath } = require('./config');

function buildPages() {
  return src(paths.pages)
    .pipe(htmlmin({ collapseWhitespace: true }))
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
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(`${distPath}/js`));
}

function buildStyles() {
  return src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(`${distPath}/css`));
}

function buildResources() {
  return src(paths.resources)
    .pipe(dest(`${distPath}/resources`));
}

exports.prodHtml = buildPages;
exports.prodTs = buildScripts;
exports.prodScss = buildStyles;
exports.prodResources = buildResources;
