"use strict";

var requires    = require('./Interface');
var {_, printf} = requires.foundation;
var parsers     = requires.parser;

let parseErrors = {
  wrongDelimiters: _.partial(printf, 'Source code should have exactly two delimiters. Delimiter: %s')
};

function compile (source, otherArgs = {}, delimiter = '------') {
  let [metadata, template, lotData] = _.block(() =>
  {
    let result = source.split(delimiter);
    if (result.length != 3)
      throw new Error(parseErrors.wrongDelimiters(delimiter));
    return result;
  });

  let options = _.extend(
    parsers.yaml.safeLoad(metadata),
    parsers.lot(lotData),
    otherArgs
  );

  let compiler = parsers.jade.compile(template, options);

  return {
    compile: (locals) => compiler.call(null, _.extend(options, locals))
  };
}

var render = (source, options, delimiter) => compile(source, options, delimiter).compile();

module.exports = {
  compile: compile,
   render: render
}
