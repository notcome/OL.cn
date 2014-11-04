var printf = require('printf');
var _ = require('underscore');

module.exports = function (format) {
  return _.partial(printf, format);
}
