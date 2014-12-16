"use strict";

var _ = require('underscore');
var jade = require('jade');
var path = require('path');

function init (templates) {
  return function (context, files) {

  jadeFiles.forEach(jadeFile => {
    let content = jade.renderFile(jadeFile.absPath, context);
    jadeFile.writeTextFile(content, '.html');
    context.content = content;
  });

  return context;
}

module.exports = init;
