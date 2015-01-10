"use strict";

var fs = require('fs');
var path = require('path');

class TextFile {
  constructor (srcRoot, destRoot = '', basename = '') {
    this.basename = basename;
    this.srcPath  = path.resolve(srcRoot, basename);
    this.destPath = path.resolve(destRoot, basename);
  }

  readTextFile () {
    return fs.readFileSync(this.srcPath, { encoding: 'utf8' });
  }

  writeTextFile (data, ext) {
    var destPath = this.destPath;
    if (ext)
      destPath = destPath.slice(0, -path.extname(this.basename).length) + ext;
    fs.writeFileSync(destPath, data, { encoding: 'utf8' });
  }
};

module.exports = TextFile;
