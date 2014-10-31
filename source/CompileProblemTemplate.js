"use strict";

var fs = require('fs');
var _ = require('underscore');
var compiler = require('./CompileJade');

var templateDir = __dirname + '/../layouts';
var problemDir = __dirname + '/../documents/problems';

var problemTemplate = fs.readFileSync(templateDir + '/problem.jade', 'utf8');
problemTemplate = compiler(problemTemplate);
var problem = fs.readFileSync(problemDir + '/iol/2014/1-benabena/problem.jade', 'utf8');
problem = compiler(problem)();

var tagUrlList = {
  'Rosetta': 'rosetta'
};


var result =
problemTemplate(_.extend(problem, {
  queryGroupName: () => 'IOL 2014',
  problemID: 'iol.2014.1-benabena',
  generateGroup: (id) => '<li>Hello</li><li>World</li>',
  tagToURL: (tag) => tagUrlList[tag]
}));

console.log(result);
