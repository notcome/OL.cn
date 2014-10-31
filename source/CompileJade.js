"use strict";

var fs = require('fs');
var jade = require('jade');
var lot = require('lot-parser');
var yaml = require('js-yaml');
var _ = require('underscore');

function compileJade (source) {
  var [metadata, template, data] = source.split('------');
  data = lot(data);
  metadata = yaml.safeLoad(metadata);

  var compiler = jade.compile(template);
  
  return function (params) {
    if (params == undefined)
      params = {};
    var content = compiler(_.extend(params, data));
    var result = _.clone(metadata);
    result.content = content;
    return result;
  }
}

module.exports = compileJade;
