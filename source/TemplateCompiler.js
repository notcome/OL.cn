var _ = require('./utils/underscore');
var printf = require('./utils/printf');
var parsers = {
  'yaml': require('js-yaml'),
  'jade': require('jade'),
   'lot': require('lot-parser')
};


    render: (locals = {}) => {
      _.extend(locals, options);
      return compiler.call(null, locals);
    }
