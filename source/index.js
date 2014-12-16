"use strict";

var _ = require('underscore');
var path = require('path');
var fs = require('fs');

var Directory = require('./Directory');

var requires    = require('./Interface');
var {_, printf} = requires.foundation;
var parsers     = requires.parser;


function generate (dir) {
  dir.makeDestDir();

  let {files, dirs} = dir.readdirAndSort();

  let isTerminal = files.reduce(
    (previous, current) => previous || current.path.slice(-8) == 'terminal',
    false);

  let reducer = (previous, current) => {
    previous[current.key] = current.value;
    return previous;
  }

  if (isTerminal) {
    _.map(dirs, dir => dir.makeDestDir());
    return {
      key: path.basename(dir.path),
      value: _.reduce(_.map(dirs, compileTerminal), reducer, {})
    };
  }

  return {
    key: path.basename(dir.path),
    value: _.reduce(_.map(dirs, generate), reducer, {})
  };
}

var initialValue = {};

function reducer () {}
var compileMetadata = require('./plugins/metadata');
var compileLot = require('./plugins/lot');
var compileJade = require('./plugins/jade');

function compileTerminal (dir) {
  let {files} = dir.readdirAndSort();

  console.log('compiling', dir.path);
  
  let context =
  [compileMetadata, compileLot, compileJade].reduce(
    (context, plugin) => plugin(context, files),
    {});

  return {
    key: path.basename(dir.path),
    value: _.pick(context, 'title', 'author', 'tags')
  };
}

function newTempPath () {
  var prefix = 'ac.yan.cn.ol';
  var random = Math.random().toString().slice(3);
  var tmpPath = '/tmp/' + prefix + random;
  if (fs.existsSync(tmpPath))
    return newTempPath();
  return tmpPath;
}

function startCompile (src, dest) {
  var tmpPath = newTempPath();
  var toc = generate(new Directory('/Users/LiuMS/Desktop/iol', tmpPath)).value;
  console.log(JSON.stringify(toc, null, 2));

  var gravePath = newTempPath();
  if (fs.existsSync(dest))
    fs.renameSync(dest, gravePath);

  fs.renameSync(tmpPath, dest);
}

startCompile('/Users/LiuMS/Desktop/iol', '/Users/LiuMS/Desktop/iol-output');
