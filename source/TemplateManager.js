"use strict";

var path = require('path');

var TemplateCompiler = require('./TemplateCompiler');
var Directory = require('./Directory');

function TemplateManager (dirpath) {
  let dir = new Directory(dirpath);

  let {files} = dir.readdirAndSort();
  let templateFiles = files.filter(file => path.basename(file.path).slice(-5) == '.jade');
  var templates = {};

  templateFiles.forEach(templateFile => {
    let templateFilename = path.basename(templateFile.path);
    let name = templateFilename.slice(0, -path.extname(templateFilename).length);

    let compiler = TemplateCompiler.compile(templateFile.readTextFile());
    templates[name] = compiler;
  });

  return templates;
}

module.exports = TemplateManager;
