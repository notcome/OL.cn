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

function compileLot (context, files) {
  console.log('Compiling lot files');

  let lotFiles = files.filter(file => path.basename(file.path).slice(-4) == '.lot');
  lotFiles.forEach(lotFile => {
    let lotText = lotFile.readTextFile();
    try {
      var lotData = parsers.lot(lotText);
    }
    catch (err) {
      console.log('In file', lotFile.absPath);
      console.log('At Line', err.line);
      console.log('Error:', err.error);
      throw err;
    }
    
    context = _.extend(context, lotData);
  });

  return context;
}

function compileMetadata (context, files) {
  console.log('Compiling metadata');

  let filteredFileList = files.filter(file => path.basename(file.path) == 'metadata.yml');
  if (filteredFileList.length == 0)
    return console.log('no metadata');
  
  let metadataFile = filteredFileList[0];
  let metadataText = metadataFile.readTextFile();
  let metadata = parsers.yaml.safeLoad(metadataText);
  return _.extend(context, metadata);
}

function compileJade (context, files) {
  console.log('Compiling jade files');
  let jadeFiles = files.filter(file => path.basename(file.path).slice(-5) == '.jade');

  jadeFiles.forEach(jadeFile => {
    let content = parsers.jade.renderFile(jadeFile.absPath, context);
    jadeFile.writeTextFile(content, '.html');
    context.content = content;
  });

  return context;
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
