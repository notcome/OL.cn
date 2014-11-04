"use strict";

var requires    = require('./Interface');
var {_, printf} = requires.foundation;

function makeGroupGenerator (tree, transformer, baseUrl = '') {
  tree = _.clone(tree);

  const listItemTemplate = printf('<li%s>%s</li>');
  const paragraphTemplate  = printf('<p>%s</p>');
  const anchorTemplate  = printf('<a href="%s">%s</a>');

  function generateItem (tree, name, match, transformer) {
    let isTerminus = match.length == 0;
    if (isTerminus)
      return anchorTemplate(baseUrl + tree, transformer[0](name));

    var result = paragraphTemplate(transformer[0](name));
    result += '<ul>';
    let children = _.keys(tree);
    children.forEach(child => {
      result += listItemTemplate(
        child == match[0] ? ' class="main"' : '',
        generateItem(tree[child], child, match.slice(1), transformer.slice(1)));
    });
    result += '</ul>';
    return result;
  }

  return (thisPath, thisName) => 
    generateItem(tree, '', thisPath, [() => thisName].concat(transformer));
}

exports.makeGroupGenerator = makeGroupGenerator;
exports.outPutGroupLabel = {
  iol: [
    title => 'IOL' + title,
    title => title[0] == 't' ?
      '团体赛'
    : ['第一题', '第二题', '第三题', '第四题', '第五题'][title[0] - '1']
  ]
};
