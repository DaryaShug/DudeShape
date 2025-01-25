const gulp = require('gulp');

const imgMin = require('gulp-imagemin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const changed = require('gulp-changed');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourceMaps = require('gulp-sourcemaps');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const plumber = require('gulp-plumber');  
const notify = require('gulp-notify');

const webpack = require('webpack-stream');
const babel = require('gulp-babel');

const fileIncludeSettings = {
    prefix: '@@',
    basepath: '@file'
};
const serverOptions = {
    livereload: true,  
    open: true  
};

const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    };
}

gulp.task('clean:dev', function(done){
    if (fs.existsSync('./build/')) {
        return gulp.src('./build/', { read: false })
            .pipe(clean({ force: true }));
    }
    done();
});

gulp.task('html:dev', function(){
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./build/', { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(gulp.dest('./build/'))
});

gulp.task('sass:dev', function(){
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./build/css/'))
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build/css/'))
});

gulp.task('images:dev', function(){
    return gulp.src('./src/img/**/*', {encoding: false})
        .pipe(changed('./build/img/'))
        .pipe(gulp.dest('./build/img/'))
});

gulp.task('js:dev', function(){
    return gulp.src('./src/js/*.js')
        .pipe(changed('./build/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./build/js/'))
});

gulp.task('server:dev', function(){
    return gulp.src('./build/').pipe(server(serverOptions))
});

gulp.task('watch:dev', function(){
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
    gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
});