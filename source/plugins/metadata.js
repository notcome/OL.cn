"use strict";

var _ = require('underscore');
var yaml = require('js-yaml');
var path = require('path');

function compileMetadata (context, files) {
  console.log('Compiling metadata.');

  let filteredFileList = files.filter(file => path.basename(file.path) == 'metadata.yml');
  if (filteredFileList.length == 0)
    return console.log('no metadata');
  
  let metadataFile = filteredFileList[0];
  let metadataText = metadataFile.readTextFile();
  let metadata = yaml.safeLoad(metadataText);
  return _.extend(context, metadata);
}

module.exports = compileMetadata;
