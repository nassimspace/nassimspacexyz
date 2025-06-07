import { src, dest, series, parallel, watch } from 'gulp';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import concat from 'gulp-concat';
import workboxBuild from 'workbox-build';
import { deleteAsync } from 'del';
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import gifsicle from 'imagemin-gifsicle';
import svgo from 'imagemin-svgo';
import plumber from 'gulp-plumber';
import gulpIf from 'gulp-if';
import { statSync } from 'fs';

// Helper function to check if files exist for a glob pattern
function hasFiles(glob) {
  try {
    const files = src(glob, { read: false });
    let exists = false;
    files.on('data', () => exists = true);
    files.on('end', () => exists);
    return exists;
  } catch (e) {
    return false;
  }
}

// Clean the dist folder
async function clean() {
  return deleteAsync(['dist']);
}

// Optimize HTML
function html() {
  return src(['src/**/*.html', '!src/offline/**/*.html'], { allowEmpty: true })
    .pipe(plumber())
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest('dist'));
}

// Optimize Offline HTML
function offlineHtml() {
  return src('src/offline/**/*.html', { allowEmpty: true })
    .pipe(plumber())
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest('dist/offline'));
}

// Optimize CSS
function css() {
  return src('src/**/*.css', { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpIf(hasFiles('src/**/*.css'), autoprefixer({ cascade: false })))
    .pipe(gulpIf(hasFiles('src/**/*.css'), cleanCSS()))
    .pipe(dest('dist'));
}

// Optimize JS
function js() {
  return src('src/**/*.js', { allowEmpty: true })
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'));
}

// Optimize Images
function images() {
  return src('src/**/*.{jpg,png,gif,svg}', { allowEmpty: true })
    .pipe(plumber())
    .pipe(gulpIf(hasFiles('src/**/*.{jpg,png,gif,svg}'), imagemin([
      mozjpeg({ quality: 75, progressive: true }),
      pngquant({ quality: [0.65, 0.8] }),
      gifsicle({ interlaced: true }),
      svgo({ plugins: [{ removeViewBox: false }] })
    ])))
    .pipe(dest('dist'));
}

// Copy other files (e.g., fonts, manifests)
function copy() {
  return src('src/**/*.{json,ico,woff,woff2}', { base: 'src', allowEmpty: true })
    .pipe(plumber())
    .pipe(dest('dist'));
}

// Generate Service Worker
async function serviceWorker() {
  return workboxBuild.generateSW({
    globDirectory: 'dist',
    globPatterns: ['**/*.{html,js,css,png,jpg,gif,svg,json,ico,woff,woff2}'],
    swDest: 'dist/sw.js',
    navigateFallback: '/offline/offline.html',
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [{
      urlPattern: /\.(?:html|js|css|png|jpg|gif|svg|json|ico|woff|woff2)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }]
  });
}

// Watch for changes during development
function watchFiles() {
  watch('src/**/*.html', html);
  watch('src/offline/**/*.html', offlineHtml);
  watch('src/**/*.css', css);
  watch('src/**/*.js', js);
  watch('src/**/*.{jpg,png,gif,svg}', images);
  watch('src/**/*.{json,ico,woff,woff2}', copy);
}

// Define tasks
export { clean, html, offlineHtml, css, js, images, copy, serviceWorker };
export const build = series(clean, parallel(html, offlineHtml, css, js, images, copy), serviceWorker);
export const watchTask = series(build, watchFiles);
export default build;