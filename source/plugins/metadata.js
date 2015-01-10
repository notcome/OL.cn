"use strict";

var _ = require('underscore');
var yaml = require('js-yaml');
var path = require('path');

function compileMetadata (context, files) {
  let filteredFileList = files.filter(file => file.basename == 'metadata.yml');
  if (filteredFileList.length == 0)
    return console.log('no metadata');
  
  let metadataFile = filteredFileList[0];
  let metadataText = metadataFile.readTextFile();
  let metadata = yaml.safeLoad(metadataText);
  return _.extend(context, metadata);
}

module.exports = compileMetadata;
