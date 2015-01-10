"use strict";

var traceur = require('traceur');
var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');

var Directory = require('./Directory');

function generate (dir) {
  dir.makeDestDir();

  let {files, dirs} = dir.readdirAndSort();

  let isTerminal = files.reduce(
    (previous, current) => previous || current.basename == 'terminal',
    false);

  let reducer = (previous, current) => {
    previous[current.key] = current.value;
    return previous;
  }

  if (isTerminal) {
    _.map(dirs, dir => dir.makeDestDir());
    return {
      key: dir.basename,
      value: _.reduce(_.map(dirs, compileTerminal), reducer, {})
    };
  }

  return {
    key: dir.basename,
    value: _.reduce(_.map(dirs, generate), reducer, {})
  };
}

function compileTerminal (dir) {
  let {files} = dir.readdirAndSort();
  let context = plugins.reduce((context, plugin) => plugin(context, files), {});
  context = _.pick(context, 'title', 'author', 'tags');
  context.terminal = true;

  return {
    key: dir.basename,
    value: context
  };
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
  var toc = generate(new Directory(src, tmpPath)).value;
  //console.log(JSON.stringify(toc, null, 2));

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
