const gulp = require("gulp");

const fileInclude = require("gulp-file-include");
const htmlclean = require("gulp-htmlclean");
const webpHTML = require("gulp-webp-html");

const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const webpCss = require("gulp-webp-css");

const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const groupMedia = require("gulp-group-css-media-queries");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

const changed = require("gulp-changed");

const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

gulp.task("clean:docs", function (done) {
  if (fs.existsSync("./docs/")) {
    return gulp.src("./docs/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const plumberHtmlConfig = {
  errorHandler: notify.onError({
    title: "HTML",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};

gulp.task("html:docs", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(plumber(plumberHtmlConfig))
    .pipe(changed("./docs/"))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(webpHTML())
    .pipe(htmlclean())
    .pipe(gulp.dest("./docs/"));
});

gulp.task("fonts:docs", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./docs/fonts/"))
    .pipe(gulp.dest("./docs/fonts/"));
});

const plumberSassConfig = {
  errorHandler: notify.onError({
    title: "Styles",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};

gulp.task("sass:docs", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed("./docs/css/"))
    .pipe(plumber(plumberSassConfig))
    .pipe(sourceMaps.init())
    .pipe(autoprefixer())
    .pipe(sassGlob())
    .pipe(webpCss())
    .pipe(groupMedia())
    .pipe(sass())
    .pipe(csso())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./docs/css/"));
});

gulp.task("images:docs", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./docs/img/"))
    .pipe(webp())
    .pipe(gulp.dest("./docs/img/"))
    .pipe(gulp.src("./src/img/**/*"))
    .pipe(changed("./docs/img/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./docs/img/"));
});

const plumberJsConfig = {
  errorHandler: notify.onError({
    title: "JS",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};

gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber(plumberJsConfig))
    .pipe(changed("./docs/js/"))
    .pipe(babel())
    .pipe(webpack(require("../webpack.config.js")))
    .pipe(gulp.dest("./docs/js"));
});

gulp.task("server:docs", function () {
  return gulp.src("./docs/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});
