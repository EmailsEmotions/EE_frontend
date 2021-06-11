const { task, watch, series, parallel } = require('gulp');

const { watchPaths } = require('./gulp/config');

/** Tasks */
const { devHtml, devTs, devScss, devResources } = require('./gulp/gulp.dev.js');
const { prodHtml, prodTs, prodScss, prodResources } = require('./gulp/gulp.prod.js');

/** Dev tasks */
task('dev:html', devHtml);
task('dev:ts', devTs);
task('dev:scss', devScss);
task('dev:resources', devResources);

/** Prod tasks */
task('build:html', prodHtml);
task('build:ts', prodTs);
task('build:scss', prodScss);
task('build:resources', prodResources);

/** Watch */
task('watch', () => {
  watch(watchPaths.pages, series('dev:html'));
  watch(watchPaths.scripts, series('dev:ts'));
  watch(watchPaths.styles, series('dev:scss'));
  watch(watchPaths.resources, series('dev:resources'));
});

/** Series */
task('dev', series(parallel('dev:html', 'dev:ts', 'dev:scss', 'dev:resources')));
task('build', series(parallel('build:html', 'build:ts', 'build:scss', 'build:resources')));
