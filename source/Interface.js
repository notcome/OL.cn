"use strict";

module.exports = {
  'foundation': {
         '_': require('underscore'),
    'printf': require('printf')
  },
  'io': {
      'fs': require('fs'),
    'http': require('http')
  },
  'async': {
      'async': require('async'),
    'suspend': require('suspend'),
     'resume': require('suspend').resume
  },
  'parser': {
    'yaml': require('js-yaml'),
    'jade': require('jade'),
     'lot': require('lot-parser')
  }
};
