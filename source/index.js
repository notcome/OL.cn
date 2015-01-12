"use strict";

var traceur = require('traceur');
var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');

var Directory = require('./Directory');

function generate (dir) {
  dir.makeDestDir();
  let {files, dirs} = dir.readdirAndSort();
  let isTerminal = _.any(files, file => file.basename == 'terminal');
  return [
    dir.basename,
    isTerminal ?
      _.object(dirs.map(compileTerminal))
    : _.object(dirs.map(generate))
  ];
}

function compileTerminal (dir) {
  dir.makeDestDir();
  let {files} = dir.readdirAndSort();
  let context = plugins.reduce((context, plugin) => plugin(context, files), {});
  context = _.pick(context, 'title', 'author', 'tags');
  context.terminal = true;

  return [dir.basename, context];
}

function newTempPath () {
  var prefix = 'ac.yan.cn.ol';
  var random = Math.random().toString().slice(3);
  var tmpPath = 'tmp/' + prefix + random;
  if (fs.existsSync(tmpPath))
    return newTempPath();
  return tmpPath;
}

function startCompile (src, dest) {
  fs.ensureDirSync('tmp');
  var tmpPath = newTempPath();
  var toc = generate(new Directory(src, tmpPath))[1];

  var makeTOCHtml = require('./makeTOCHtml');
  var tocHTML = makeTOCHtml(toc);
  fs.writeFileSync(tmpPath + '/index.html', tocHTML, 'utf8');

  var gravePath = newTempPath();
  if (fs.existsSync(dest))
    fs.renameSync(dest, gravePath);

  fs.renameSync(tmpPath, dest);
  fs.removeSync('tmp');
}

var templates = require('./TemplateManager')('layouts');
var plugins = require('./plugins')(templates);

startCompile('documents/problems', 'output/problems');
