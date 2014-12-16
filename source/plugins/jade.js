"use strict";

var _ = require('underscore');
var jade = require('jade');
var path = require('path');

function compileJade (context, files) {
  console.log('Compiling jade files.');
  let jadeFiles = files.filter(file => path.basename(file.path).slice(-5) == '.jade');

  jadeFiles.forEach(jadeFile => {
    let content = jade.renderFile(jadeFile.absPath, context);
    jadeFile.writeTextFile(content, '.html');
    context.content = content;
  });

  return context;
}

module.exports = compileJade;
