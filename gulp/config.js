const distPath = 'public';

const paths = {
  dev: 'src/**/*',
  pages: 'src/html/*.html',
  scripts: 'src/ts/index.ts',
  styles: 'src/scss/*.scss',
  resources: 'src/resources/**/*',
};

const watchPaths = {
  pages: 'src/html/**/*.html',
  styles: 'src/scss/**/*.scss',
  scripts: 'src/ts/**/*.ts',
  resources: 'src/resources/**/*',
};

exports.watchPaths = watchPaths;
exports.distPath = distPath;
exports.paths = paths;
