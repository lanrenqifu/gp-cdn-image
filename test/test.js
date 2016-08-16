var gulp = require('gulp');
var index = require('../');

gulp.src(['./*.css', './*.html'])
  .pipe(index({
      host: {
        max: 10,
        min: 5,
        name: 'yx-s.com',
        prefix: 'p'
      }
    }))
  .pipe(gulp.dest('dist/'));
