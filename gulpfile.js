var gulp = require('gulp');
var zip = require('gulp-zip');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
var mocha = require('gulp-mocha');

var project = require('./package.json');

gulp.task('test', function() {
  gulp.src('tests/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}))
});

gulp.task('build-zip',  function () {

  return gulp.src([
    './*.js',
    './*.md',
    './*.json'
  ], {base: '..'})
    .pipe(zip('mongoose-i18n-neutral-'+project.version+'.zip'))
    .pipe(gulp.dest('build/release'));

});

gulp.task('build-tar',  function () {

  return gulp.src([
    './*.js',
    './*.md',
    './*.json',
    './LICENSE'
  ], {base: '..'})
    .pipe(tar('mongoose-i18n-neutral-'+project.version+'.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('build/release'));

});

gulp.task('build', ['build-zip', 'build-tar']);

gulp.task('default', ['build']);
