"use strict";

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var TextFile = require('./TextFile');

class Directory {
  constructor (srcRoot, destRoot = '', basename = '') {
    this.basename = basename;
    this.srcPath  = path.resolve(srcRoot, basename);
    this.destPath = path.resolve(destRoot, basename);
  }

  readdir () {
    return fs.readdirSync(this.srcPath);
  }

  makeDestDir () {
    fs.mkdirSync(this.destPath);
  }

  readdirAndSort () {
    let isSystemFile = filename => filename[0] == '.';
    let isDirectory  = filename => fs.statSync(path.join(this.srcPath, filename)).isDirectory();

    let contentList = this.readdir();
    let [systemContentList, normalContentList] = _.partition(contentList, isSystemFile);
    let [systemDirs, systemFiles] = _.partition(systemContentList, isDirectory);
    let [normalDirs, normalFiles] = _.partition(normalContentList, isDirectory);

    let srcRoot  = this.srcPath;
    let destRoot = this.destPath;
    let directoryFactory = filename => new Directory(srcRoot, destRoot, filename);
    let textFileFactory  = filename => new TextFile(srcRoot, destRoot, filename);

    return {
      systemFiles: _.map(systemFiles, textFileFactory),
      systemDirs:  _.map(systemDirs, directoryFactory),
      files:       _.map(normalFiles, textFileFactory),
      dirs:        _.map(normalDirs, directoryFactory)
    };
  }
}

module.exports = Directory;
