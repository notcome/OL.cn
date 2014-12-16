"use strict";

var _ = require('underscore');
var lot = require('lot-parser');
var path = require('path');

function compileLot (context, files) {
  console.log('Compiling lot files.');

  let lotFiles = files.filter(file => path.basename(file.path).slice(-4) == '.lot');
  lotFiles.forEach(lotFile => {
    let lotText = lotFile.readTextFile();
    try {
      var lotData = lot(lotText);
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

module.exports = compileLot;
