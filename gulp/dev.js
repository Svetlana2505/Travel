const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
// const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");

gulp.task("clean:dev", function (done) {
  if (fs.existsSync("./build/")) {
    return gulp.src("./build/", { read: false }).pipe(clean({ force: true }));
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

gulp.task("html:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(plumber(plumberHtmlConfig))
    .pipe(changed("./build/", { hasChanged: changed.compareContents }))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("./build/"));
});

gulp.task("fonts:dev", function () {
  return gulp
    .src("src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});

const plumberSassConfig = {
  errorHandler: notify.onError({
    title: "Styles",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};

gulp.task("sass:dev", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(plumber(plumberSassConfig))
    .pipe(changed("./build/css/"))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourceMaps.write())
    .pipe(gulp.dest("./build/css/"));
});

gulp.task("images:dev", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(changed("./build/img/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./build/img/"));
});

const plumberJsConfig = {
  errorHandler: notify.onError({
    title: "JS",
    message: "Error <%= error.message %>",
    sound: false,
  }),
};

gulp.task("js:dev", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(plumber(plumberJsConfig))
      .pipe(changed("./build/js/"))
      // .pipe(babel())
      .pipe(webpack(require("./../webpack.config.js")))
      .pipe(gulp.dest("./build/js"))
  );
});

gulp.task("server:dev", function () {
  return gulp.src("./build/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

gulp.task("watch:dev", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass:dev"));
  gulp.watch("./src/**/*.html", gulp.parallel("html:dev"));
  gulp.watch("./src/img/**/*", gulp.parallel("images:dev"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts:dev"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js:dev"));
});
