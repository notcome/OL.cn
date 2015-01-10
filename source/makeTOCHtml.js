'use strict';

var jade = require('jade');

function generate (set, section, link) {
  if (set.terminal)
    return newLinkSection(set.title, set.author, link + '/problem.html');

  var content = '';
  for (var subsection in set)
    content += generate(set[subsection], subsection, link + '/' + subsection);

  var title = mapping(section);
  return newContainerSection(title, content);
}

function newLinkSection (title, author, link) {
  return [
    '<section class="problem">',
    '<h1>' + title + '</h1>',
    author ? '<p class="author">' + author + '</p>' : '',
    '<a href="' + link + '">链接</a>',
    '</section>'
  ].join('\n');
}

function newContainerSection (title, content) {
  return [
    '<section class="toc-container">',
    '<h1>' + title + '</h1>',
    content,
    '</section>'
  ].join('\n');
}

var dict = {
  'iol': 'IOL | 国际语言学奥林匹克竞赛',
  'nol': 'NOL | 全国语言学奥林匹克竞赛',
  'yellow-book': '苏联语言学奥林匹克竞赛，1965—1975',
  'semantics': '语义学'
}

function mapping (key) {
  if (dict[key])
    return dict[key];
  else
    return key;
}

module.exports = function (set) {
  var tmp = generate(set, '题库', '/problems').split('\n');
  tmp = tmp.slice(2, -1).join('\n');
  return jade.renderFile('toc.jade', {
    content: tmp
  });
}
