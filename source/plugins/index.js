"use strict";

module.exports = function (templates) {
  return [
    require('./metadata'),
    require('./lot'),
    require('./jade')(templates)
  ];
}
