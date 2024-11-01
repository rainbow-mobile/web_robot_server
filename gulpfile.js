const gulp = require("gulp"),
  uglify = require("gulp-uglify-es").default,
  javascriptObfuscator = require("gulp-javascript-obfuscator");

gulp.task("uglify", () => {
  return gulp
    .src("src/**/*.js")
    .pipe(uglify())
    .pipe(
      javascriptObfuscator({
        compact: true,
        renameGlobals: true,
        unicodeEscapeSequence: true,
        splitStrings: true,
        selfDefending: true,
        controlFlowFlattening: true,
      })
    )
    .pipe(gulp.dest("dist"));
});

//파일 변경 감지
gulp.task("watch", () => {
  gulp.watch("src/**/*.js", gulp.series(["uglify"]));
});

gulp.task("default", gulp.series(["uglify"]));
