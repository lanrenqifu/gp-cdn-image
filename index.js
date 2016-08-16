'use strict';

var gutil = require('gulp-util'),
path = require('path'),
through = require('through2'),
scan = require('css-resources'),
scanhtml = require('getimage'),
upload = require('./lib/upload-image');

/**
 * 将图片上传cdn
 * @param puburl 上传远程地址
 * @param param data 携带上传数据
 */

module.exports = function(puburl, param) {
    param = param || {};
    //newby1 2016-03-19 支持自定义路径和后缀
    param.cssTypeExts = param.cssTypeExts || ['.css'];
    param.notCssTypeExts = param.notCssTypeExts || ['.html', '.js'];
    param.relativePath = param.relativePath || '';
    //param.notCssTypeRelativePath = param.notCssTypeRelativePath || '';
    //计数 所有扫出来的图片地址都处理了 插件的执行才算结束
    var unprocess = 0;
    return through.obj(function (file, enc, cb) {
        if(file.isNull()) {
            return cb(null, file);
        }
        if(file.isStream()) {
            return cb(new gutil.PluginError('gp-cdn-image', 'Streaming not supported'));
        }
        //目前只支持css、html
        var output = [],res,
        ext = path.extname(file.path);
        if( param.cssTypeExts.indexOf(ext) > -1) {
            res = scan(file.contents.toString());
        } else if(param.notCssTypeExts.indexOf(ext) > -1) {
            res = scanhtml(file.contents.toString());
        } else {
            return cb(new gutil.PluginError('gp-cdn-image', 'Not support file: ' + path.file + ' !'));
        }
        if(!Array.isArray(res)) {
            return cb(new gutil.PluginError('gp-cdn-image', 'Scan file: ' + path.file + ' failed'));
        }

        res.forEach(function(val){
            if (val && val.path) {
                var tmpPath = val.path;
                // 排除base64和外链的资源
                if (/^data:image\//.test(tmpPath) || /^(https?:)?\/\//.test(tmpPath)) {
                    return;
                }
                //去除静态资源问号
                var markIndex = tmpPath.indexOf('?');
                if (markIndex > -1) {
                    tmpPath = tmpPath.slice(0, markIndex);
                }
                val.ori =  tmpPath;
                //追加相对路径
                val.path = tmpPath.indexOf('./') > -1 ? tmpPath : param.relativePath + tmpPath;
                output.push(val);
            }
        });

        var that = this;
        var newCss = file.contents.toString();
        unprocess = output.length;
        if(unprocess > 0) {
            upload(puburl, file, output, param)
            .done(function(data) {
                if(data) {
                    data.forEach(function(item) {
                        output.forEach(function(_item) {
                            if(item.path == _item.path) {
                                newCss = newCss.replace(item.ori, item.cdn);
                            }
                        });
                    });
                    try {
                        file.contents = new Buffer(newCss);
                        that.push(file);
                    } catch (err) {
                        that.emit('error', new gutil.PluginError('gp-cdn-image', err));
                    }
                }
                cb();
            });
        } else {
            cb(null, file);
        }
    });
};
