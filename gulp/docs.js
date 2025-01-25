const gulp = require('gulp');

const changed = require('gulp-changed');

//Images
const imgMin = require('gulp-imagemin');
const webp = require('gulp-webp');

// HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean'); 
const webpHTML = require('gulp-webp-html');

//SASS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries'); 
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso'); 
const webpCSS = require('gulp-webp-css');

const server = require('gulp-server-livereload');

//clean
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

gulp.task('clean:docs', function(done){
    if (fs.existsSync('./docs/')) {
        return gulp.src('./docs/', { read: false })
            .pipe(clean({ force: true }));
    }
    done();
});

gulp.task('html:docs', function(){
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./docs/'))
        .pipe(plumber(plumberNotify('HTML')))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(webpHTML())
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'))
});

gulp.task('sass:docs', function(){
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./docs/css/'))
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(webpCSS())
        // .pipe(groupMedia())  // 
        .pipe(sass())
        .pipe(csso())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css/'))
});

gulp.task('images:docs', function(){
    return gulp.src('./src/img/**/*', {encoding: false})
        .pipe(changed('./docs/img/'))
        .pipe(webp())
        .pipe(gulp.dest('./docs/img/'))

        .pipe(gulp.src('./src/img/**/*', {encoding: false}))
        .pipe(changed('./docs/img/'))
        .pipe(imgMin({ verbose: true }))
        .pipe(gulp.dest('./docs/img/'))
});

gulp.task('js:docs', function(){
    return gulp.src('./src/js/*.js')
        .pipe(changed('./docs/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(babel())
        .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./docs/js/'))
});

gulp.task('server:docs', function(){
    return gulp.src('./docs/').pipe(server(serverOptions))
});