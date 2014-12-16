"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

function Directory (srcRoot, destRoot = '', thisPath = '') {
  this.srcRoot  = srcRoot;
  this.destRoot = destRoot;
  this.path     = thisPath;
  this.absPath  = path.resolve(srcRoot, thisPath);
  this.destAbsPath = path.resolve(destRoot, thisPath);
}

Directory.prototype.readdir = function () {
  return fs.readdirSync(this.absPath);
}

Directory.prototype.makeDestDir = function () {
  console.log('makeDestDir:', this.destAbsPath);
  fs.mkdirSync(path.join(this.destAbsPath));
};

Directory.prototype.readTextFile = function () {
  return fs.readFileSync(this.absPath, { encoding: 'utf8' });
}

Directory.prototype.writeTextFile = function (data, ext) {
  var thisPath = this.destAbsPath;
  if (ext)
    thisPath = thisPath.slice(0, -path.extname(thisPath).length) + ext;

  fs.writeFileSync(thisPath, data, { encoding: 'utf8' });
}

Directory.prototype.readdirAndSort = function () {
  let isSystemFile = filename => filename[0] == '.';
  let notDirectory = filename =>
    !fs.statSync(path.join(this.absPath, filename)).isDirectory();

  let contentList = this.readdir();

  let [systemContentList, normalContentList] = _.partition(contentList, isSystemFile);
  let [systemFiles, systemDirs] = _.partition(systemContentList, notDirectory);
  let [normalFiles, normalDirs] = _.partition(normalContentList, notDirectory);


  let directoryFactory = filename =>
    new Directory(this.srcRoot, this.destRoot, path.join(this.path, filename));
  return {
    systemFiles: _.map(systemFiles, directoryFactory),
    systemDirs: _.map(systemDirs, directoryFactory),
    files: _.map(normalFiles, directoryFactory),
    dirs: _.map(normalDirs, directoryFactory)
  };
};

module.exports = Directory;
