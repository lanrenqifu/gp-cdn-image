# gp-cdn-image - 替换文件中的图片地址为cdn地址

能够查找文件中的图片并且尝试将图片发布至cdn地址 并且将文件中的图片地址替换
暂时只支持css文件与html文件

TODO .js 

## A Simple Example
可以直接这样调用

```js
var gulp = require('gulp');
var cdnImage = require('gp-cdn-image');

gulp.src(['css/*.css', 'html/*.html'])
  .pipe(cdnImage())
  .pipe(gulp.dest('dist/'));
```

## Free set host Example
可以这样传入想要设置的host

```js
var gulp = require('gulp');
var cdnImage = require('gp-cdn-image');

gulp.src(['css/*.css', 'html/*.html'])
  .pipe(cdnImage({host:'res.lanrenqifu.com'}))
  .pipe(gulp.dest('dist/'));
```



