'use strict';

var q = require('q');
var uploadDispatch = require('lr-upload-file');
var path = require('path');
var util = require('lr-util-file');
var isRelativeUrl = require('is-relative-url');
var debug = require('lr-util-debug');
var urlUtil = require('wurl');

module.exports = function(puburl, file, ars, param) {
  var deferred = q.defer();
  if(!ars || !ars.length) {
    debug.log('文件：', file.path + ' 没有找到图片');
    deferred.resolve(null);
  }
  var times = ars.length,
    flag = 0;
  var output = [];
  ars.forEach(function(items) {
    items.path = (items.path.match(/^\//) && util.isFile(items.path))
      ? items.path : items.path.replace(/^\//, './');

    var fileUrl = isRelativeUrl(items.path) ? path.resolve(path.dirname(file.path), items.path) : items.path;

    if(util.isUrl(fileUrl) || util.isFile(fileUrl)) {

      uploadDispatch.upload(puburl, {
        files: fileUrl,
        file: file
      }, param, function(err, data) {
        if(err) {
          debug.error('上传失败，原因是：' + err);
        }
        if(data) {
          for(var k in data) {
            var resultUrl = data[k];
            items.cdn = resultUrl;
            debug.log('提示', '发送文件 ' + file.path + ' 中的图片：'  + items.path + ' 成功，替换为 ' + resultUrl);
          }
          output.push(items);
        }
        if(++flag == times) {
          deferred.resolve(output);
        }
      })
    } else {
      if(++flag == times) {
        deferred.resolve(output);
      }
      debug.warn('文件 ' + file.path + ' 中的图片：'  + fileUrl + ' 不存在');
    }
  });
  return deferred.promise;
}
