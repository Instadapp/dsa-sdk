
const gulp = require('gulp');
const path = require('path');

const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;

const dsaFiles = [
    path.resolve(__dirname, 'src/constant.js'),
    path.resolve(__dirname, 'src/helpers.js'),
    path.resolve(__dirname, 'src/index.js'),
]

const dsaBundled = path.resolve(__dirname, 'build/');

gulp.task('scripts', function() {
    return gulp.src(dsaFiles)
        .pipe(concat('dsa.js'))
        .pipe(gulp.dest(dsaBundled))
        .pipe(rename('dsa.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dsaBundled));
})